#!/bin/bash

# Create the .env file.local
touch .env.file.local

# Add the venv/ folder path to the .env file.local
echo "VENV_PATH=/path/to/venv/folder" >> .env.file.local

echo "Successfully created .env.file.local and added venv/ folder path."