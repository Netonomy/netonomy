import llama_cpp


def load_model(path: str, n_ctx: int = 2048):
    model = llama_cpp.Llama(
        model_path=path,
        chat_format="llama-2",
        n_ctx=n_ctx,
        n_gpu_layers=1
    )

    return model

def chat_completion(model, messages, max_tokens=200, verbose=True):
    output = model.create_chat_completion(
            messages=messages,
            stream=True,
            max_tokens=max_tokens,
        )

    if verbose:
        print("Assistant: ", end="")

    total_output = ""
    for event in output:
        data = event['choices'][0]['delta']
        if "content" in data:
            token = data['content']
            total_output += token

            if verbose:
                print(token, end="")
    
    if verbose:
        print()

    return total_output


def main():
    model = load_model("../models/llama/llama-2-7b-chat.Q4_K_M.gguf")

    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant."
        }
    ]

    while True:
        # Read user input
        user_input = input("You: ")

        messages.append({
            "role": "user",
            "content": user_input
        })

        output = chat_completion(model, messages)

        messages.append({
            "role": "assistant",
            "content": output
        })
        

if __name__ == "__main__":
    main()