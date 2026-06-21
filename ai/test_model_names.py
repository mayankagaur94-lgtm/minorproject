import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model_name = 'gemini-1.5-flash-latest'
print(f"Testing model: {model_name}")
try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Failed with {model_name}: {e}")

model_name = 'gemini-1.5-flash'
print(f"Testing model: {model_name}")
try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Failed with {model_name}: {e}")
