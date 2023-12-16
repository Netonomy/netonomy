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
use tokenizers::Tokenizer;

const MODEL_PATH: &str = "/Users/anthonydemattos/netonomy/models/llama/llama-2-7b-chat.Q4_K_M.gguf";
const TOKENIZER_REPO: &str = "hf-internal-testing/llama-tokenizer";
const DEFAULT_PROMPT: &str = "My favorite theorem is ";
const MAX_LENGTH: usize = 100;

fn main() -> anyhow::Result<()> {
    if cfg!(feature = "mkl") {
        println!("The 'mkl' feature is enabled");
    } else {
        println!("The 'mkl' feature is not enabled");
    }

    if cfg!(feature = "accelerate") {
        println!("The 'accelerate' feature is enabled");
    } else {
        println!("The 'accelerate' feature is not enabled");
    }

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
        let prompt_str: String = DEFAULT_PROMPT.to_string().clone();

        println!("{}", &prompt_str);

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

        let eos_token: &str = "</s>";
        let eos_token: u32 = *tos.tokenizer().get_vocab(true).get(eos_token).unwrap();

        let mut sampled = 0;

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
            sampled += 1;
            if next_token == eos_token {
                break;
            };
        }

        if let Some(rest) = tos.decode_rest().map_err(candle_core::Error::msg)? {
            print!("{rest}");
        }
    }

    Ok(())
}

fn fetch_tokenizer(repo: &str) -> anyhow::Result<Tokenizer> {
    let api = hf_hub::api::sync::Api::new()?;
    let api = api.model(repo.to_string());
    let tokenizer_path: PathBuf = api.get("tokenizer.json")?;

    Tokenizer::from_file(tokenizer_path).map_err(anyhow::Error::msg)
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
