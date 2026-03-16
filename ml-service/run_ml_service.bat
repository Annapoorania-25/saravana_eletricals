@echo off
echo Starting ML Service for Smart Hardware Store...
echo.

cd /d "D:\Consultancy Project\hardware-store-project\ml-service"

echo Creating virtual environment (if needed)...
if not exist "venv\Scripts\python.exe" (
  python -m venv venv
) else (
  echo Virtual environment already exists, skipping creation.
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing required packages...
python -m pip install -r requirements.txt

echo.
echo Starting ML Service on http://localhost:8000
echo Press Ctrl+C to stop
echo.

uvicorn ml_api:app --reload --host 0.0.0.0 --port 8000

pause