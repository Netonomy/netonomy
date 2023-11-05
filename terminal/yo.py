import argparse
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
from dotenv import load_dotenv
import subprocess
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.schema import AIMessage, HumanMessage, SystemMessage
import ast


load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=str)
    args = parser.parse_args()

    # Get the question
    question = args.input

    # Create the chat model
    chat = ChatOpenAI(temperature=0, openai_api_key=openai_api_key, model_name="gpt-4")

    # Create the messages
    messages = [
        SystemMessage(
            content="""You are a system that outputs a list of code commands to run.
Each command will be run as a shell process.
You are on MacOS and you have Python 3.10 installed.
You are given a question and you must output a list of commands to run. 
These commands with then be run one after the other.
Output as array of string.""",
        ),
        HumanMessage(
            content=question
        ),
    ]

    # Run the chat model
    output = chat(messages)
    output = output.content

    # Safely evaluate the string as a Python literal
    commands_list = ast.literal_eval(output)

    # Loop thorugh the commands and run them
    for command in commands_list:
        print(command)

        # Run the command
        subprocess.run(command, shell=True) 


    # messages = [
    #         HumanMessage(
    #             content=question
    #         ),
    #     ]

    # # Run the chat model
    # output = chat(messages)
    # output = output.content

    # print(output)

if __name__ == "__main__":
    main()