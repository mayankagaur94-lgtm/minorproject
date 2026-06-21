import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

models_to_test = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest']

for model_name in models_to_test:
    print(f"Testing model: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"Success! Response: {response.text[:50]}...")
    except Exception as e:
        print(f"Failed with {model_name}: {e}")
