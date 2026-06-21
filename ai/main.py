import os
import json
import base64
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional, List
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)
DEFAULT_MODEL = 'gemini-2.5-flash-lite'

SCHEMA_CONTEXT = """
The MongoDB database has the following collections:
- university: name, location, established, contact, website
- colleges: name, code, dean
- students: roll_no, name, department, year, semester, cgpa, status, gender, email, academic_status, is_lateral_entry
- faculty: name, department, designation, experience_yrs, email
- bus: route_no, driver, contact, route, timing
- mess: day, breakfast, lunch, dinner
- hostel: name, type, capacity, warden, fee_per_sem
- admissions: course, intake, last_date, eligibility, fee_annual, duration_years, lateral_entry_available
- placements: student_roll, company, package_lpa, role, status
- marks: student_roll, subject_code, subject_name, exam_type, marks_obtained, max_marks, grade, semester
"""

class ImageData(BaseModel):
    mimeType: str
    base64: str

class AudioData(BaseModel):
    mimeType: str
    base64: str

class CsvData(BaseModel):
    name: str
    headers: List[str]
    rows: List[dict]
    rawText: Optional[str] = None

class QueryRequest(BaseModel):
    query: Optional[str] = ""
    csv_data: Optional[CsvData] = None
    image_data: Optional[ImageData] = None
    audio_data: Optional[AudioData] = None
    model_name: Optional[str] = "gemini-2.5-flash-lite"

class WrappedResponse(BaseModel):
    input: dict
    output: dict

def format_response(wrapper: dict, style: str = "list") -> str:
    """Return a human‑readable representation of the wrapper.
    * ``style`` can be "list" (default) or "table".
    """
    inp = wrapper.get("input", {})
    out = wrapper.get("output", {})
    lines: list[str] = []
    lines.append("--- Input ---")
    lines.append(f"Query: {inp.get('query', '')}")
    lines.append(f"CSV Context: {inp.get('csv_context', '').strip()[:200]}{'...' if len(inp.get('csv_context', '')) > 200 else ''}")
    lines.append(f"Has Image: {inp.get('has_image')}")
    lines.append(f"Has Audio: {inp.get('has_audio')}")
    lines.append("--- Output ---")
    lines.append(f"Collection: {out.get('collection')}")
    lines.append(f"Type: {out.get('type')}")
    lines.append(f"Explanation: {out.get('explanation')}")
    lines.append(f"Detected Language: {out.get('detected_language')}")
    lines.append(f"SQL Query: {out.get('sql_query')}")
    lines.append("Schema Links:")
    for link in out.get('schema_links', []):
        lines.append(f"  - {link}")
    # Render the actual query/result data
    query_part = out.get('query')
    if style == "table" and isinstance(query_part, list):
        if query_part:
            headers = list(query_part[0].keys())
            header_line = "| " + " | ".join(headers) + " |"
            separator = "|" + "---|" * len(headers)
            lines.append("\n--- Result Table ---")
            lines.append(header_line)
            lines.append(separator)
            for rec in query_part:
                row = "| " + " | ".join(str(rec.get(h, "")) for h in headers) + " |"
                lines.append(row)
    else:
        lines.append("\n--- Result List ---")
        if isinstance(query_part, dict):
            for k, v in query_part.items():
                lines.append(f"{k}: {v}")
        elif isinstance(query_part, list):
            for idx, item in enumerate(query_part, 1):
                lines.append(f"[{idx}] {item}")
        else:
            lines.append(str(query_part))
    return "\n".join(lines)

async def _process_query(request: QueryRequest) -> dict:
    """Core logic shared by POST and GET endpoints.
    Returns the raw result dictionary produced by the Gemini model.
    """
    user_query = request.query or ""
    print(f"Received query: {user_query}")

    # Build CSV context if supplied
    csv_context = ""
    if request.csv_data:
        csv_context = f"\n\nAttached CSV File: {request.csv_data.name}\nHeaders: {', '.join(request.csv_data.headers)}\nRows (showing first 50 rows):\n"
        for row in request.csv_data.rows[:50]:
            csv_context += f"{json.dumps(row)}\n"

    # Prompt for the model
    prompt = f"""
You are an expert Database Assistant specialized in MongoDB (MQL) and SQL for a University Management System.

Schema Context:
{SCHEMA_CONTEXT}

IMPORTANT - Exact Department Names stored in the database (use these for matching):
"B.Tech CSE", "B.Tech Civil", "BCA", "B.Sc Nursing", "BHM",
"Biotech", "Microbiology", "B.Com", "M.Com", "BMLT", "B.Sc Agriculture", "MBA"

IMPORTANT - Extra student fields:
- academic_status: "Regular" or "Backlog"  (use this to find backlog students)
- is_lateral_entry: true or false  (use this to find lateral entry students)

User Query: "{user_query}"
{csv_context}

Tasks:
1. Detect the language of the user query or audio if present (English, Hindi, or Hinglish).
2. Perform Schema Linking: Identify all collections (tables) and fields (columns) that relate to the user's query. Output these links in "schema_links". Format: ["collection_name.field_name -> query_term"]
3. Generate a valid MongoDB query (MQL) to answer the user's question.
   - If the query requires joins, grouping, counting, averaging, or multi‑stage pipelines, return an array (list) for "query" and set "type" to "aggregation". Example: [ {{"$match": ...}}, {{"$lookup": ...}} ].
4. Generate an equivalent, valid SQL query matching the user request for reference (SQL Generation).
5. CRITICAL RULE - Department Matching: ALWAYS use $regex with case‑insensitive option for department fields.
   Examples:
   - User says "btech" or "B.Tech" -> use: {{"department": {{"$regex": "B.Tech", "$options": "i"}}}}
   - User says "cse" -> use: {{"department": {{"$regex": "CSE", "$options": "i"}}}}
   - NEVER use exact match like {{"department": "B.Tech"}} as it won't match "B.Tech CSE".
6. For backlog students, use: {{"academic_status": "Backlog"}}
7. For lateral entry students, use: {{"is_lateral_entry": true}}
8. For failed marks (grade F), filter marks collection by: {{"grade": "F"}}
9. Multi‑Table Joins: If the query requires combining collections (e.g. students and their marks, or students and placements), you MUST generate a MongoDB aggregation pipeline using `$lookup`.
   Example ($lookup from students to placements):
   [
     {{ "$match": {{ "department": {{ "$regex": "CSE", "$options": "i" }} }} }},
     {{
       "$lookup": {{
         "from": "placements",
         "localField": "roll_no",
         "foreignField": "student_roll",
         "as": "placement_info"
       }}
     }},
     {{ "$unwind": {{ "path": "$placement_info", "preserveNullAndEmptyArrays": true }} }}
   ]
   Corresponding SQL:
   "SELECT * FROM students LEFT JOIN placements ON students.roll_no = placements.student_roll WHERE students.department LIKE '%CSE%'"
10. If an image, audio voice message, or CSV file is attached, analyze it. If the query is about the attached media (e.g., "describe this image" or transcribing/answering the audio/voice message) and does NOT require querying the database:
    - Set "query" to null.
    - Set "collection" to "".
    - Set "type" to "find".
    - Place the complete description/answer in the "explanation" field.
11. Return the result in the following JSON format:
{{
    "query": {{ "FIELD": "VALUE" }} or [ {{ "$match": ... }}, {{ "$lookup": ... }} ] or null,
    "collection": "collection_name",
    "type": "find" or "aggregation",
    "explanation": "Brief explanation in English",
    "detected_language": "Detected language name",
    "followup_suggestions": ["Suggested query 1", "Suggested query 2"],
    "sql_query": "SQL SELECT query",
    "schema_links": ["table_name.field_name -> entity"]
}}

Constraints:
- Ensure the queries are read‑only.
- Do not include any markdown formatting like ```json. Return ONLY the raw JSON string.
"""
    # Prepare contents for the model (image/audio if any)
    contents = []
    if request.image_data:
        try:
            img_bytes = base64.b64decode(request.image_data.base64)
            contents.append({"mime_type": request.image_data.mimeType, "data": img_bytes})
            print(f"Added image attachment: {request.image_data.mimeType}")
        except Exception as ex:
            print(f"Failed to parse image data: {ex}")
    if request.audio_data:
        try:
            audio_bytes = base64.b64decode(request.audio_data.base64)
            contents.append({"mime_type": request.audio_data.mimeType, "data": audio_bytes})
            print(f"Added audio attachment: {request.audio_data.mimeType}")
        except Exception as ex:
            print(f"Failed to parse audio data: {ex}")
    contents.append(prompt)

    selected_model = request.model_name or DEFAULT_MODEL
    print(f"Dynamically generating content using model: {selected_model}")
    try:
        response = client.models.generate_content(model=selected_model, contents=contents)
    except Exception as model_err:
        err_str = str(model_err)
        if '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str or 'quota' in err_str.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exhausted. Please try again later or use a different API key."
            )
        raise HTTPException(status_code=500, detail=f"AI model error: {err_str}")
    text = response.text.strip()
    print(f"AI RAW RESPONSE:\n{text}\n---")

    # Clean possible markdown wrappers
    cleaned_text = text
    if "```json" in cleaned_text:
        cleaned_text = cleaned_text.split("```json")[1].split("```", 1)[0].strip()
    elif "```" in cleaned_text:
        cleaned_text = cleaned_text.split("```", 1)[1].split("```", 1)[0].strip()
    result = json.loads(cleaned_text)
    print(f"PARSED RESULT: {result}")

    # Ensure collection field exists
    if "collection" not in result:
        result["collection"] = "students"
    return result

async def generate_mql(request: QueryRequest = None, query: str = "") -> WrappedResponse:
    """Endpoint implementation shared for POST and GET.
    If called via GET, ``query`` will contain the value from the query string.
    ``request`` will be ``None`` for GET calls.
    """
    if request is None:
        request = QueryRequest(query=query)
    user_query = request.query or ""
    # The core processing that interacts with Gemini
    result = await _process_query(request)
    response_wrapper = {
        "input": {
            "query": user_query,
            "csv_context": ""  # CSV context is already embedded in the result if needed
            ,"has_image": bool(request.image_data),
            "has_audio": bool(request.audio_data)
        },
        "output": result,
    }
    return response_wrapper

# POST endpoint for full JSON payloads
@app.post("/generate", response_model=WrappedResponse)
async def generate_mql_post(request: QueryRequest):
    return await generate_mql(request)

# Formatted output endpoint (POST)
@app.post("/generate_formatted", response_class=PlainTextResponse)
async def generate_formatted_post(request: QueryRequest, style: str = "list"):
    wrapper = await generate_mql(request)
    formatted = format_response(wrapper.dict() if hasattr(wrapper, "dict") else wrapper, style)
    return PlainTextResponse(content=formatted, media_type="text/plain")

# Formatted output endpoint (GET)
@app.get("/generate_formatted", response_class=PlainTextResponse)
async def generate_formatted_get(query: str = "", style: str = "list"):
    try:
        wrapper = await generate_mql(None, query)
        formatted = format_response(wrapper.dict() if hasattr(wrapper, "dict") else wrapper, style)
        return PlainTextResponse(content=formatted, media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "0")))
