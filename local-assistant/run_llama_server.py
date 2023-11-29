import subprocess
import sys

def run_llama_server(model_path: str):
    command = ["python3", "-m", "llama_cpp.server", "--model", model_path]
    subprocess.run(command)

if __name__ == "__main__":
    # Take in path to model as argument
    model_path = sys.argv[1]
    assert model_path is not None
    run_llama_server(model_path=model_path)