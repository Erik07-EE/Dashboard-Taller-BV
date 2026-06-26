@echo off
setlocal
set "CARPETA=C:\Users\Estrada\Desktop\Claude\Reportes\Taller BV"
cd /d "%CARPETA%"
echo.
echo  Preparando archivos...
git add -A
git commit -m "Actualizacion dashboard %DATE% %TIME%"
echo.
echo  Subiendo a GitHub...
git push origin main
if errorlevel 1 (
    echo ------------------------------------------------
    echo  ERROR al publicar. Revisa la salida arriba.
    echo ------------------------------------------------
) else (
    echo ------------------------------------------------
    echo  OK - Dashboard publicado en GitHub Pages.
    echo ------------------------------------------------
)
echo.
pause
