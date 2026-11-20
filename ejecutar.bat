@echo off
REM Lanzador para Windows.
REM Uso: doble clic en ejecutar.bat  o  ejecutarlo desde cmd / PowerShell

REM UTF-8 para que se vean bien las tildes, flechas y tablas
chcp 65001 >nul

REM Ir a la carpeta del script (funciona desde cualquier directorio)
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js.
  echo Instalalo desde https://nodejs.org y volve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

node -e "process.exit(+process.versions.node.split('.')[0] < 17 ? 1 : 0)"
if errorlevel 1 (
  echo Se necesita Node.js 17 o superior. Version instalada:
  node -v
  echo Instala una version mas nueva desde https://nodejs.org
  echo.
  pause
  exit /b 1
)

node index.js
echo.
pause
