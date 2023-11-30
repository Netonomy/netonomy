import whisper

def load_model(model_name):
    print("Loading model...")
    model = whisper.load_model(model_name)
    print("Model loaded.")
    return model


if __name__ == "__main__":
   model = load_model("tiny")

   result = model.transcribe("./rogan_pod.mp3")
   print(result["text"])