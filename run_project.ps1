# Set path to portable Node v22.11.0
$env:Path = "C:\Users\raahu\OneDrive\Documents\PAPERPILOT\node_portable22\node-v22.11.0-win-x64;" + $env:Path

# Start Backend Server in a new PowerShell window
Write-Host "Starting PaperPilot FastAPI Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd paperpilot/backend; .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

# Start Frontend Server in a new PowerShell window
Write-Host "Starting PaperPilot React Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "`$env:Path = 'C:\Users\raahu\OneDrive\Documents\PAPERPILOT\node_portable22\node-v22.11.0-win-x64;' + `$env:Path; cd paperpilot/frontend; npm.cmd run dev"

Write-Host "PaperPilot is launching!" -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
