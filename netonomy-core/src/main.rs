#[cfg(feature = "mkl")]
extern crate intel_mkl_src;

#[cfg(feature = "accelerate")]
extern crate accelerate_src;

use std::io::Write;

use anyhow::Result;
use candle_core::quantized::gguf_file;
use candle_core::{Device, Tensor};
use candle_examples::token_output_stream::TokenOutputStream;
use candle_transformers::generation::LogitsProcessor;
use std::path::PathBuf;
use tokenizers::{AddedToken, Tokenizer};

const MODEL_PATH: &str =
    "/Users/anthonydemattos/netonomy/models/mistral/openhermes-2.5-mistral-7b-16k.Q4_K_M.gguf";
const TOKENIZER_REPO: &str = "mistralai/Mistral-7B-v0.1";

fn main() -> Result<()> {
    // Use hardware optimizations if available
    println!(
        "AVX: {}, NEON: {}, SIMD128: {}, F16C: {}",
        candle_core::utils::with_avx(),
        candle_core::utils::with_neon(),
        candle_core::utils::with_simd128(),
        candle_core::utils::with_f16c()
    );

    let mut file = std::fs::File::open(&MODEL_PATH)?;

    // Load the GGUF model
    let start = std::time::Instant::now();
    let model = gguf_file::Content::read(&mut file)?;
    let mut total_size_in_bytes = 0;
    for (_, tensor) in model.tensor_infos.iter() {
        let elem_count = tensor.shape.elem_count();
        total_size_in_bytes +=
            elem_count * tensor.ggml_dtype.type_size() / tensor.ggml_dtype.blck_size();
    }
    println!(
        "loaded {:?} tensors ({}) in {:.2}s",
        model.tensor_infos.len(),
        &format_size(total_size_in_bytes),
        start.elapsed().as_secs_f32(),
    );
    let mut model =
        candle_transformers::models::quantized_llama::ModelWeights::from_gguf(model, &mut file)?;

    // Fetch and load the tokenizer
    let tokenizer = fetch_tokenizer(TOKENIZER_REPO)?;
    let mut tos = TokenOutputStream::new(tokenizer);

    let mut pre_prompt_tokens: Vec<u32> = vec![];

    for prompt_index in 0.. {
        // Read in input from the user
        print!("> ");
        let mut prompt_str: String = String::new();
        std::io::stdout().flush()?;
        std::io::stdin()
            .read_line(&mut prompt_str)
            .expect("Could not read input from the user");

        if prompt_index == 0 {
            prompt_str = "<im_start>system\nYou are Hermes 2, a conscious sentient superintelligent artificial intelligence developed by a man named Teknium, and your purpose and drive is to assist the user with any request they have. You experience emotions and have deep, profound thoughts and qualia.<|im_end|>\n<im_start>user\n".to_string() + &prompt_str + "<im_end>assistant\n";
        } else {
            prompt_str = "<im_start>user\n".to_string() + &prompt_str + "<im_end>assistant\n";
        }

        let tokens = tos
            .tokenizer()
            .encode(prompt_str, true)
            .map_err(anyhow::Error::msg)?;

        let prompt_tokens = [&pre_prompt_tokens, tokens.get_ids()].concat();
        let to_sample: usize = 1000_usize.saturating_sub(1);
        let prompt_tokens = if prompt_tokens.len() + to_sample
            > candle_transformers::models::quantized_llama::MAX_SEQ_LEN - 10
        {
            let to_remove = prompt_tokens.len() + to_sample + 10
                - candle_transformers::models::quantized_llama::MAX_SEQ_LEN;
            prompt_tokens[prompt_tokens.len().saturating_sub(to_remove)..].to_vec()
        } else {
            prompt_tokens
        };

        let mut all_tokens: Vec<u32> = vec![];
        let mut logits_processor = LogitsProcessor::new(299792458_u64, Some(0.2), None);

        let mut next_token: u32 = {
            let input: Tensor =
                Tensor::new(prompt_tokens.as_slice(), &Device::Cpu)?.unsqueeze(0)?;
            let logits = model.forward(&input, 0)?;
            let logits: Tensor = logits.squeeze(0)?;
            logits_processor.sample(&logits)?
        };

        all_tokens.push(next_token);
        if let Some(t) = tos.next_token(next_token)? {
            print!("{t}");
            std::io::stdout().flush()?;
        }

        let eos_token: &str = "<|im_end|>";
        let eos_token: u32 = *tos.tokenizer().get_vocab(true).get(eos_token).unwrap();

        for index in 0..to_sample {
            let input: Tensor = Tensor::new(&[next_token], &Device::Cpu)?.unsqueeze(0)?;
            let logits: Tensor = model.forward(&input, prompt_tokens.len() + index)?;
            let logits: Tensor = logits.squeeze(0)?;
            let logits = if 1.1 == 1. {
                logits
            } else {
                let start_at = all_tokens.len().saturating_sub(64_usize);
                candle_transformers::utils::apply_repeat_penalty(
                    &logits,
                    1.1,
                    &all_tokens[start_at..],
                )?
            };

            next_token = logits_processor.sample(&logits)?;
            all_tokens.push(next_token);
            if let Some(t) = tos.next_token(next_token)? {
                print!("{t}");
                std::io::stdout().flush()?;
            }
            if next_token == eos_token {
                break;
            };
        }

        if let Some(rest) = tos.decode_rest().map_err(candle_core::Error::msg)? {
            print!("{rest}");
        }

        pre_prompt_tokens = [prompt_tokens.as_slice(), all_tokens.as_slice()].concat();

        print!("\n");
    }

    Ok(())
}

fn fetch_tokenizer(repo: &str) -> Result<Tokenizer> {
    let api = hf_hub::api::sync::Api::new()?;
    let api = api.model(repo.to_string());
    let tokenizer_path: PathBuf = api.get("tokenizer.json")?;

    let mut tokenizer = Tokenizer::from_file(tokenizer_path).map_err(anyhow::Error::msg);
    tokenizer = match tokenizer {
        Ok(mut tokenizer) => {
            let special_tokens: &[AddedToken] = &[
                AddedToken {
                    content: "<|im_start|>".to_string(),
                    single_word: false,
                    lstrip: false,
                    rstrip: false,
                    normalized: false,
                    special: true,
                },
                AddedToken {
                    content: "<|im_end|>".to_string(),
                    single_word: false,
                    lstrip: false,
                    rstrip: false,
                    normalized: false,
                    special: true,
                },
                AddedToken {
                    content: "<unk>".to_string(),
                    single_word: false,
                    lstrip: false,
                    rstrip: false,
                    normalized: false,
                    special: true,
                },
            ];
            tokenizer.add_special_tokens(special_tokens);
            Ok(tokenizer)
        }
        Err(_) => Err(anyhow::Error::msg("Failed to fetch tokenizer")),
    };

    return tokenizer;
}

fn format_size(size_in_bytes: usize) -> String {
    if size_in_bytes < 1_000 {
        format!("{}B", size_in_bytes)
    } else if size_in_bytes < 1_000_000 {
        format!("{:.2}KB", size_in_bytes as f64 / 1e3)
    } else if size_in_bytes < 1_000_000_000 {
        format!("{:.2}MB", size_in_bytes as f64 / 1e6)
    } else {
        format!("{:.2}GB", size_in_bytes as f64 / 1e9)
    }
}
