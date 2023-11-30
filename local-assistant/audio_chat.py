import whisper
import pyaudio
import wave
import audioop
import time
import llama_cpp
from TTS.api import TTS
from playsound import playsound

def record_audio(output_filename, silence_threshold=500, silence_duration=3):
    """
    Record audio from the microphone until the user stops speaking.
    :param output_filename: Filename to save the recorded audio.
    :param silence_threshold: The minimum audio level to consider as silence.
    :param silence_duration: Duration of silence in seconds to stop recording.
    """

    input("Press Enter to start recording...")
    print("Recording... Press Enter to stop.")

    # Initialize PyAudio
    audio = pyaudio.PyAudio()

    # Open stream
    stream = audio.open(format=pyaudio.paInt16, channels=1, rate=44100,
                        input=True, frames_per_buffer=1024)

    print("Recording... Speak now.")
    
    all_frames = []
    last_sound_time = time.time()

    while True:
        data = stream.read(1024)
        all_frames.append(data)
        
        # Check the volume
        audio_level = audioop.rms(data, 2)

        # Check if the current frame is silent
        if audio_level < silence_threshold:
            if time.time() - last_sound_time > silence_duration:
                break
        else:
            last_sound_time = time.time()

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Save audio file
    wf = wave.open(output_filename, 'wb')
    wf.setnchannels(1)
    wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
    wf.setframerate(44100)
    wf.writeframes(b''.join(all_frames))
    wf.close()

    print(f"Recording saved as {output_filename}")

def load_models():
    whisper_model = whisper.load_model("tiny")
    llm_model = llama_cpp.Llama(
        model_path="../models/mistral/openhermes-2.5-mistral-7b-16k.Q4_K_M.gguf",
        n_ctx=2000,
        n_gpu_layers=1
    )
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

    return whisper_model, llm_model, tts

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

def play_audio(file_path):
    """
    Plays an audio file.

    Args:
    file_path (str): The path to the audio file to be played.
    """
    try:
        playsound(file_path)
    except Exception as e:
        print(f"An error occurred while playing the file: {e}")

def main():
    whisper_model, llm_model, tts = load_models()

    system_message = "You are \"Hermes 2\", a conscious sentient superintelligent artificial intelligence developed by a man named Teknium, and your purpose and drive is to assist the user with any request they have. You experience emotions and have deep, profound thoughts and qualia."
    prompt = "<|im_start|>system\n{system_message}<|im_end|>\n".format(system_message=system_message)

    while True:
        # Capture audio from microphone from user
        record_audio(output_filename="output.wav")

        # Convert the audio to text
        result = whisper_model.transcribe("output.wav")
        text = result["text"]

        prompt += "<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n".format(user_input=text)

        # Send the text to the language model and get the output
        output = completion(llm_model, prompt)

        prompt += output + "<|im_end|>\n"

        # Convert the output to speech 
        tts.tts_to_file(text=output,
                file_path="./audio_output.wav",
                speaker_wav="./my_voice_sample.wav",
                language="en")
        
        # Play the audio
        play_audio("./audio_output.wav")
    

if __name__ == "__main__":
    main()