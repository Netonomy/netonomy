import llama_cpp
import subprocess
import argparse
import re
import io
import contextlib

# Load the LLM model using llama_cpp
def load_model(path, n_ctx=8000):
    model = llama_cpp.Llama(
        model_path=path,
        n_ctx=n_ctx,
        n_gpu_layers=1,
        temp=0
    )

    return model

# Use the LLM model to generate text
# Give it the ability to execute code
def completion(model, prompt, max_tokens=2000, verbose=True):
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
            # Check for code blocks, and print them in red
            code_blocks = re.findall(r"```(python|bash)(.*?)```", token, re.DOTALL)
            if len(code_blocks) > 0:
                print("\033[91m", end="")
            else:
                print(token, end="", flush=True)
    
    if verbose:
        print()

    # Check for code blocks, and execute them in order
    code_blocks = re.findall(r"```(python|bash)(.*?)```", total_output, re.DOTALL)
    code_output = ""
    for code_type, code in code_blocks:
        code = code.strip()  # Remove leading/trailing whitespace

        # print("\033[91mCode Type: {}\033[0m".format(code_type))
        # print("\033[91mCode: {}\033[0m".format(code))

        if code_type == "python":
            try:
                with contextlib.redirect_stdout(io.StringIO()) as f:
                    exec(code)
                    code_output += f.getvalue() + "\n"
            except Exception as e:
                print("An error occurred while executing the Python code: {}".format(e))
                code_output += str(e) + "\n"

        elif code_type == "bash":
            try:
                code_output += subprocess.check_output(code, shell=True).decode('utf-8') + "\n"
            except Exception as e:
                print("An error occurred while executing the Bash code: {}".format(e))
                code_output += str(e) + "\n"
        
        if verbose:
            print("Code Execution Output: {}".format(code_output))

    # If there are no code blocks, then just return the output
    if len(code_blocks) == 0:
        prompt += total_output + "<|im_end|>\n"
        return prompt 
    # Otherwise, get the code output and send it back to the assistant
    else:
        # Add the code output to ai assistant output
        prompt += total_output + "<|im_end|>\n<|im_start|>system\n" + "Code Execeution Output: " + str(code_output) + "\nUse the code output as context to answer the users question<|im_end|>\n<|im_start|>assistant\n"
        return completion(model, prompt, verbose=True)


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
    system_message = """You are a AI Assistant running locally on a users computer, and your purpose and drive is to assist the user with any request they have. 
    
    You have the ability to write and execute python and bash code that will run on the computer. ONLY write code when its necessary. When it is put it in blocks like this:
    ```python
    print("Hello World!")
    ```
    
    Again, only write code when its necessary. If its not just respond with text."""
    prompt = "<|im_start|>system\n{system_message}<|im_end|>\n".format(system_message=system_message)

    while True:
        user_input = input("User: ")
        prompt += "<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n".format(user_input=user_input)

        prompt = completion(model, prompt)

if __name__ == "__main__":
    main()