# Startup Script for University AI System

Write-Host "Starting University AI System..." -ForegroundColor Cyan

# 1. Start AI Microservice
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai; python main.py" -Title "AI Service (Port 8000)"

# 2. Start Backend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; node index.js" -Title "Backend API (Port 5000)"

# 3. Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -Title "Frontend (Vite)"

Write-Host "All services starting. Please wait for them to initialize." -ForegroundColor Green
Write-Host "Note: Ensure you have added your GEMINI_API_KEY to ai/main.py or .env" -ForegroundColor Yellow
