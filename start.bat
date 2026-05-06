@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set NAPKAT=D:\Program Files\NapCat\NapCat.44498.Shell\NapCatWinBootMain.exe
set CT=atri-bot-websocket
set IMG=atri-bot-napcat
set EF=%cd%\.env

:menu
cls
echo.
echo   ============================================
echo        ATRI Bot V2 - NapCat QQ Robot
echo   ============================================
echo.
echo   1. Start NapCat
echo   2. Build Docker
echo   3. Start Bot
echo   4. View Logs
echo   5. Stop Bot
echo   6. Full Start
echo   7. Full Stop
echo   8. Status
echo   0. Exit
echo.
set opt=
set /p opt=   Enter:
if "%opt%"=="" goto menu
if "%opt%"=="1" goto napcat
if "%opt%"=="2" goto bld
if "%opt%"=="3" goto bot
if "%opt%"=="4" goto log
if "%opt%"=="5" goto stp
if "%opt%"=="6" goto full
if "%opt%"=="7" goto fstp
if "%opt%"=="8" goto sta
if "%opt%"=="0" goto out
goto menu

:napcat
cls
echo   Starting NapCat...
if exist "%NAPKAT%" (
    start "" "%NAPKAT%"
    echo   [OK] NapCat launched
) else (
    echo   [FAIL] Not found
)
pause
goto menu

:bld
cls
call :dk
if errorlevel 1 goto menu
echo   [Build] Building image...
docker stop %CT% >nul 2>&1
docker rm %CT% >nul 2>&1
docker build -t %IMG% .
if %ERRORLEVEL% equ 0 (echo   [OK] Built) else (echo   [FAIL])
pause
goto menu

:bot
cls
call :dk
if errorlevel 1 goto menu
echo   [Start] Starting Bot...
docker stop %CT% >nul 2>&1
docker rm %CT% >nul 2>&1
docker run -d -v "%cd%\data:/app/data" --env-file "%EF%" --name %CT% %IMG% node src/main-websocket.js
if %ERRORLEVEL% neq 0 (
    echo   [FAIL] Start failed
    pause
    goto menu
)
echo   Waiting...
ping -n 6 127.0.0.1 >nul
call :vf
pause
goto menu

:log
cls
call :dk
if errorlevel 1 goto menu
echo   Live logs (Ctrl+C to exit)...
docker logs -f %CT%
goto menu

:stp
cls
call :dk
if errorlevel 1 goto menu
echo   [Stop] Stopping...
docker stop %CT% >nul 2>&1
docker rm %CT% >nul 2>&1
echo   [OK] Stopped
pause
goto menu

:full
cls
call :dk
if errorlevel 1 goto menu
echo   ============================================
echo            One-Click Full Start
echo   ============================================
echo   [1/3] Launch NapCat...
if exist "%NAPKAT%" (
    start "" "%NAPKAT%"
    echo   [OK] NapCat launched
) else (
    echo   [SKIP] Not found
)
echo   [2/3] Start Bot...
docker stop %CT% >nul 2>&1
docker rm %CT% >nul 2>&1
docker images -q %IMG% | findstr . >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo   [Skip] Image exists, skipping build
) else (
    echo   [Build] Building image...
    docker build -t %IMG% .
    if !ERRORLEVEL! neq 0 (
        echo   [FAIL] Build failed
        pause
        goto menu
    )
    echo   [OK] Build done
)
docker run -d -v "%cd%\data:/app/data" --env-file "%EF%" --name %CT% %IMG% node src/main-websocket.js
if !ERRORLEVEL! neq 0 (
    echo   [FAIL] Start failed
    pause
    goto menu
)
echo   [OK] Container started, waiting...
ping -n 8 127.0.0.1 >nul
echo   [3/3] Verify...
call :vf
echo   ============================================
echo       Done! Use option 4 for live logs
echo   ============================================
pause
goto menu

:fstp
cls
call :dk
if errorlevel 1 goto menu
echo   [Stop] Stopping all...
docker stop %CT% >nul 2>&1
docker rm %CT% >nul 2>&1
echo   [OK] Stopped
pause
goto menu

:sta
cls
call :dk
if errorlevel 1 goto menu
echo   ========== Container ==========
docker ps --filter "name=%CT%" --format "table {{.Names}}\t{{.Status}}" 2>nul
echo   ========== Logs ==========
docker logs --tail 15 %CT% 2>nul
call :vf
pause
goto menu

:dk
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [FAIL] Docker Desktop is NOT running!
    pause
    exit /b 1
)
exit /b 0

:vf
docker ps --filter "name=%CT%" --filter "status=running" --format "{{.Names}}" 2>nul | findstr "%CT%" >nul
if %ERRORLEVEL% neq 0 (
    echo   [FAIL] Container crashed! Logs:
    docker logs --tail 20 %CT%
    exit /b 0
)
docker logs --tail 30 %CT% 2>nul | findstr "WebSocket" >nul
if %ERRORLEVEL% equ 0 (
    echo   [OK] Bot connected to NapCat!
    exit /b 0
)
docker logs --tail 30 %CT% 2>nul | findstr "ECONNREFUSED" >nul
if %ERRORLEVEL% equ 0 (
    echo   [FAIL] Cannot connect - is NapCat running?
    exit /b 0
)
echo   [OK] Bot starting up...
docker logs --tail 15 %CT%
exit /b 0

:out
exit /b 0
