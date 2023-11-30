from TTS.api import TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# generate speech by cloning a voice using default settings
tts.tts_to_file(text="""Using PyInstaller to package your Python application along with all its dependencies (including pip packages) into an executable for distribution is a practical approach. Here's a simplified guide to do so:

Prepare Your Python Environment:

Ensure you have all the necessary packages installed in your Python environment. Use pip install <package_name> for any missing packages.
Install PyInstaller:

If you haven't already, install PyInstaller using pip install pyinstaller.
Create the Executable:

Navigate to your project's directory in the command line.
Run pyinstaller --onefile your_script_name.py. Replace your_script_name.py with the name of your Python script.
The --onefile flag tells PyInstaller to package everything into a single executable file.""",
                file_path="./output.wav",
                speaker_wav="./samples_en_sample.wav",
                language="en")