@echo off
echo Starting MongoDB server...

REM Start MongoDB server if not already running
start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db

REM Wait for MongoDB to start
timeout /t 5

echo Connecting to MongoDB and setting up database...

REM Run MongoDB setup script
"C:\Users\meghn\Downloads\mongosh-2.3.4-win32-x64\mongosh-2.3.4-win32-x64\bin\mongosh.exe" D:\Mood_tracker\mongodb_setup.js

if %errorlevel% neq 0 (
    echo Failed to run MongoDB setup script
    exit /b %errorlevel%
)

echo MongoDB setup complete.
pause
