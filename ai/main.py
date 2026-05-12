import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

SCHEMA_CONTEXT = """
The MongoDB database has the following collections:
- university: name, location, established, contact, website
- colleges: name, code, dean
- students: roll_no, name, department, year, semester, cgpa, status, gender, email
- faculty: name, department, designation, experience_yrs, email
- bus: route_no, driver, contact, route, timing
- mess: day, breakfast, lunch, dinner
- hostel: name, type, capacity, warden, fee_per_sem
- admissions: course, intake, last_date, eligibility, fee_annual
"""

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query: dict # This will be the MongoDB query or aggregation pipeline
    type: str # 'find' or 'aggregation'
    explanation: str
    detected_language: str
    followup_suggestions: Optional[List[str]] = []

@app.post("/generate", response_model=QueryResponse)
async def generate_mql(request: QueryRequest):
    user_query = request.query
    
    prompt = f"""
    You are an expert MongoDB Query assistant for a University Management System.
    
    Schema Context:
    {SCHEMA_CONTEXT}
    
    User Query: "{user_query}"
    
    Tasks:
    1. Detect the language of the user query (English, Hindi, or Hinglish).
    2. Generate a valid MongoDB query to answer the user's question. 
    3. If the query requires joins (e.g., student and marks), use an aggregation pipeline with $lookup.
    4. If it's a simple search, you can use a find object.
    5. Return the result in the following JSON format:
    {{
        "query": {{ "FIELD": "VALUE" }} or [ {{ "$match": ... }}, {{ "$lookup": ... }} ],
        "type": "find" or "aggregation",
        "explanation": "Brief explanation in English",
        "detected_language": "Detected language name",
        "followup_suggestions": ["Suggested query 1", "Suggested query 2"]
    }}
    
    Constraints:
    - Ensure the query is read-only.
    - Do not include any markdown formatting like ```json. Return ONLY the raw JSON string.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean the response if it contains markdown code blocks
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        result = json.loads(text.strip())
        return result
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        
        # Generic fallback
        return {
            "query": {},
            "type": "find",
            "explanation": f"AI Error: {str(e)}. Please check your GEMINI_API_KEY.",
            "detected_language": "Unknown",
            "followup_suggestions": ["Check API Key"]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
