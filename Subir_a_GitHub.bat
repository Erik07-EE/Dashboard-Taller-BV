@echo off
setlocal
set "CARPETA=C:\Users\Estrada\Desktop\Claude\Reportes\Taller BV"
set "PAGINA=https://Erik07-EE.github.io/Dashboard-Taller-BV/Dashboard_Pedidos.html"
cd /d "%CARPETA%"

echo.
echo  ==================================================
echo    Publicar Dashboard Taller BV
echo  ==================================================
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :sin_repo

REM --- Hay archivos modificados sin guardar? ---
set "HAY_CAMBIOS="
for /f "delims=" %%A in ('git status --porcelain 2^>nul') do set "HAY_CAMBIOS=1"

REM --- Hay cambios ya guardados pero sin subir? ---
git fetch origin main >nul 2>&1
set "HAY_PENDIENTES="
for /f "delims=" %%A in ('git log origin/main..HEAD --oneline 2^>nul') do set "HAY_PENDIENTES=1"

if not defined HAY_CAMBIOS if not defined HAY_PENDIENTES goto :nada_nuevo
if not defined HAY_CAMBIOS goto :solo_subir

echo  Se van a publicar estos archivos:
echo.
git status --short
echo.
set /p "RTA=  Publicar estos cambios? (S/N): "
if /i not "%RTA%"=="S" goto :cancelado

echo.
echo  Preparando archivos...
git add -A
git commit -m "Actualizacion dashboard %DATE% %TIME%"
if errorlevel 1 goto :error_guardar
goto :subir

:solo_subir
echo  No hay archivos nuevos, pero quedaron cambios sin subir:
echo.
git log origin/main..HEAD --oneline
echo.

:subir
echo.
echo  Subiendo a GitHub...
git push origin main
if errorlevel 1 goto :error_subir

echo.
echo  --------------------------------------------------
echo   OK - Dashboard publicado.
echo.
echo   %PAGINA%
echo.
echo   Puede tardar un minuto en verse actualizado.
echo  --------------------------------------------------
goto :fin

:nada_nuevo
echo  No hay nada nuevo para publicar.
echo  El dashboard que esta online ya es el ultimo.
goto :fin

:cancelado
echo.
echo  Cancelado. No se subio nada.
goto :fin

:sin_repo
echo  ERROR: esta carpeta no esta preparada para publicar.
echo  Falta el historial de cambios (.git).
goto :fin

:error_guardar
echo.
echo  --------------------------------------------------
echo   ERROR al preparar los cambios. Mira el detalle arriba.
echo   No se subio nada.
echo  --------------------------------------------------
goto :fin

:error_subir
echo.
echo  --------------------------------------------------
echo   ERROR al publicar. Mira el detalle arriba.
echo   Los cambios quedaron guardados en tu maquina,
echo   asi que no se perdio nada. Se puede reintentar.
echo  --------------------------------------------------
goto :fin

:fin
echo.
pause
