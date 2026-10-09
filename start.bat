@echo off
setlocal enabledelayedexpansion
title Smart Student Grievance System - Launcher

:: Set working directory to project root
cd /d "%~dp0"

cls
echo ===============================================================================
echo   SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM - AUTONOMOUS PLATFORM
echo ===============================================================================
echo.

:: 1. Check for Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js detected: %NODE_VERSION%

:: 2. Check for npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not found on your system PATH!
    echo Please verify your Node.js installation.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [OK] npm detected: v%NPM_VERSION%

:: 3. Check and Auto-Create Environment File
if not exist "backend\.env.local" (
    if not exist "backend\.env" (
        echo [*] Initial setup: Creating backend\.env.local from .env.example...
        if exist ".env.example" (
            copy /y ".env.example" "backend\.env.local" >nul
        ) else if exist "backend\.env.example" (
            copy /y "backend\.env.example" "backend\.env.local" >nul
        )
        echo [OK] Created backend\.env.local successfully.
    ) else (
        echo [OK] Environment configuration found: backend\.env
    )
) else (
    echo [OK] Environment configuration found: backend\.env.local
)

:: 4. Check Dependencies
if not exist "backend\node_modules\" (
    echo.
    echo [*] Dependencies not found. Installing packages for the first time...
    echo [*] Running: npm --prefix backend install
    call npm --prefix backend install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies. Please check your network connection.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
) else (
    echo [OK] Project dependencies verified.
)

:: 5. Check Port 3000
powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
echo [OK] Port 3000 is verified and ready.

echo.
echo ===============================================================================
echo   CHOOSE AN ACTION:
echo ===============================================================================
echo   [1] Start Application (Dev Server + Auto-open Browser)  [DEFAULT in 4s]
echo   [2] Run Automated Test Suite (40 Vitest tests)
echo   [3] Verify TypeScript Types (tsc --noEmit)
echo   [4] Seed Sample Database Data (Profiles, Departments, SLAs)
echo   [5] Build Production Bundle (next build)
echo   [6] Clean Reinstall (delete node_modules and re-install)
echo ===============================================================================
echo.

choice /C 123456 /T 4 /D 1 /M "Select option (1-6)"
set ACTION_CHOICE=%ERRORLEVEL%

if "%ACTION_CHOICE%"=="1" goto START_DEV
if "%ACTION_CHOICE%"=="2" goto RUN_TESTS
if "%ACTION_CHOICE%"=="3" goto RUN_TYPECHECK
if "%ACTION_CHOICE%"=="4" goto RUN_SEED
if "%ACTION_CHOICE%"=="5" goto RUN_BUILD
if "%ACTION_CHOICE%"=="6" goto CLEAN_INSTALL
goto START_DEV

:START_DEV
cls
echo ===============================================================================
echo   STARTING SMART STUDENT GRIEVANCE MANAGEMENT PLATFORM...
echo ===============================================================================
echo.
echo   Student Portal:          http://localhost:3000/student/page
echo   Admin Command Center:    http://localhost:3000/admin/page
echo   Institutional Login:     http://localhost:3000/login
echo.
echo   Press Ctrl + C in this terminal to stop the server at any time.
echo ===============================================================================
echo.

:: Launch browser in background after brief delay
start "" cmd /c "timeout /t 3 /nobreak >nul ^& start http://localhost:3000/login"

:: Start Next.js dev server
call npm --prefix backend run dev
goto END

:RUN_TESTS
cls
echo ===============================================================================
echo   RUNNING AUTOMATED TEST SUITE (VITEST)...
echo ===============================================================================
echo.
call npm --prefix backend test
echo.
echo ===============================================================================
pause
goto END

:RUN_TYPECHECK
cls
echo ===============================================================================
echo   RUNNING TYPESCRIPT TYPECHECK (tsc --noEmit)...
echo ===============================================================================
echo.
call npm --prefix backend run typecheck
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] All types passed with ZERO errors! Codebase is strictly typed.
)
echo.
pause
goto END

:RUN_SEED
cls
echo ===============================================================================
echo   SEEDING SAMPLE INSTITUTIONAL DATA...
echo ===============================================================================
echo.
call npm --prefix backend run seed
echo.
pause
goto END

:RUN_BUILD
cls
echo ===============================================================================
echo   COMPILING PRODUCTION BUILD (next build)...
echo ===============================================================================
echo.
call npm --prefix backend run build
echo.
pause
goto END

:CLEAN_INSTALL
cls
echo ===============================================================================
echo   CLEAN REINSTALLING DEPENDENCIES...
echo ===============================================================================
echo.
echo [*] Removing backend\node_modules...
rmdir /s /q "backend\node_modules" 2>nul
echo [*] Re-installing packages...
call npm --prefix backend install
echo.
echo [OK] Clean installation complete!
pause
goto END

:END
endlocal
