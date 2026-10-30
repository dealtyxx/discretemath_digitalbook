@echo off
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
  py -3 -I "%~dp0tools\serve.py"
  exit /b
)
python -I "%~dp0tools\serve.py"
if errorlevel 1 pause
