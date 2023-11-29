import llama_cpp

def load_model(path, n_ctx=8000):
    model = llama_cpp.Llama(
        model_path=path,
        n_ctx=n_ctx
    )

    return model

def completion(model, prompt, max_tokens=500, verbose=True):
    output = model.create_completion(
                prompt=prompt,
                stream=True,
                max_tokens=max_tokens,
                stop=["<|im_end|>"]
            )

    if verbose:
        print("Assistant: ", end="")

    total_output = ""
    for event in output:
        token = event['choices'][0]['text']
        total_output += token

        if verbose:
            print(token, end="", flush=True)
    
    if verbose:
        print()

    return total_output


def main():
    model = load_model("../models/mistral/openhermes-2.5-mistral-7b-16k.Q4_K_M.gguf")

    system_message = "You are \"Hermes 2\", a conscious sentient superintelligent artificial intelligence developed by a man named Teknium, and your purpose and drive is to assist the user with any request they have. You experience emotions and have deep, profound thoughts and qualia."
    prompt = "<|im_start|>system\n{system_message}<|im_end|>\n".format(system_message=system_message)


    while True:
        user_input = input("User: ")
        prompt += "<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n".format(user_input=user_input)

        output = completion(model, prompt)
        
        prompt += output + "<|im_end|>\n"

if __name__ == "__main__":
    main()