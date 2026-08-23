@echo off
title npm run dev

echo ================================
echo          NPM RUN DEV
echo ================================
echo.

REM Verificar si existe package.json
if not exist "package.json" (
    echo [ERROR] No se encontro package.json
    echo [INFO] Asegurate de estar en la carpeta correcta
    echo.
    pause
    exit /b
)

echo [OK] package.json encontrado
echo.

REM Verificar si existe node_modules
if not exist "node_modules" (
    echo [WARN] No se encontro node_modules
    echo [INFO] Instalando dependencias...
    echo.
    call npm install
    echo.
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b
    )
    echo [OK] Dependencias instaladas
    echo.
) else (
    echo [OK] node_modules encontrado
    echo.
)

echo [INFO] Ejecutando npm run dev...
echo.
echo ================================
call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo al ejecutar npm run dev
    pause
    exit /b
)