import llama_cpp
import subprocess
import argparse
import re

def load_model(path, n_ctx=8000):
    model = llama_cpp.Llama(
        model_path=path,
        n_ctx=n_ctx,
        n_gpu_layers=1
    )

    return model



def completion(model, prompt, max_tokens=1000, verbose=True):
    output = model.create_completion(
                prompt=prompt,
                stream=True,
                max_tokens=max_tokens,
                temperature=0,
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

    code_blocks = re.findall(r"```(python|bash)(.*?)```", total_output, re.DOTALL)

    for code_type, code in code_blocks:
        code = code.strip()  # Remove leading/trailing whitespace

        if code_type == "python":
            try:
                code_output = exec(code)

                if verbose:
                    print("Code Execution Output: " + str(code_output))
            except Exception as e:
                print("An error occurred while executing the Python code: {}".format(e))
                code_output = e

        elif code_type == "bash":
            try:
                code_output = subprocess.check_output(code, shell=True)

                if verbose:
                    print("Code Execution Output: " + str(code_output))
            except Exception as e:
                print("An error occurred while executing the Bash code: {}".format(e))
                code_output = e

        # Add the code output to ai assistant output
        total_output += "\n" + "Code Execution Output: " + str(code_output) 

        # Send the code output to the assistant
        prompt += "Code Execution Output: " + str(code_output) + "<|im_end|>\n" + "<|im_start|>assistant\n"
        completion(model, prompt, max_tokens=1000, verbose=True)

    return total_output


def main():
    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-mmodel", "--model", help="The path to the model to use.", default="../models/mistral/openhermes-2.5-mistral-7b-16k.Q4_K_M.gguf")
    args = parser.parse_args()
    model_path = args.model
    assert model_path is not None, "Please provide a model path."

    # Load the model
    model = load_model(model_path)

    # Prompt "Engineering"
    system_message = """You are an AI Assistant running locally a users computer. You can write and execute python and bash code that will run on the computer. Put the code in blocks like this:
    ```python
    print("Hello World!")
    ```
    
    ```bash
    echo "Hello World!"
    ```
    
    When you write code, it will be executed on the computer, then the response will be given back to you, then you can respond to the user. So after writing code, you should wait to get the response back before finishing your response to the user."""
    prompt = "<|im_start|>system\n{system_message}<|im_end|>\n".format(system_message=system_message)


    while True:
        user_input = input("User: ")
        prompt += "<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n".format(user_input=user_input)

        output = completion(model, prompt)

        prompt += output + "<|im_end|>\n"


if __name__ == "__main__":
    main()