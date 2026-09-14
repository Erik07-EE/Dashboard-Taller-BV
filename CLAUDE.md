# CLAUDE.md — Proyecto Dashboard Taller BV (Electroestrada)

Contexto del proyecto. El trabajo se hace en **Claude Code sobre Windows**
(antes se hacía en Cowork; esa etapa está cerrada).

## Qué es

Dashboard de producción del Taller BV (motores eléctricos): producción por GA
(Inducidos/Rotores/Estatores) y pedidos urgentes. Es un único HTML que se publica en
GitHub Pages.

- Dashboard: `Dashboard_Pedidos.html` (en esta carpeta)
- Publicar: `Subir_a_GitHub.bat` (doble clic)
- GitHub Pages: https://Erik07-EE.github.io/Dashboard-Taller-BV/Dashboard_Pedidos.html
- Google Sheet fileId: `1iO9pLENWSmQAv9VlJsmz-nQsa88NqdVJ` (es un XLSX, no un Sheet nativo)
- Git: erik@electroestrada.com.ar / Erik07-EE

## Cómo trabajar (IMPORTANTE)

Cuando el usuario diga **"actualizar dashboard"** (o sync/actualizar producción), seguir la
skill `taller-bv-dashboard`, que se carga sola al abrir esta carpeta.

- `.claude/skills/taller-bv-dashboard/` — flujo, reglas y métricas
- `.claude/skills/taller-bv-dashboard-tech/` — estructura del XLSX y detalle técnico
- `scripts/tbv_sync.py` — extrae, compara (`preview`), aplica (`aplicar`), verifica (`verificar`)
- `scripts/validar.js` — validación del HTML resultante

**La lógica del sync vive en los scripts, no en el chat.** Si algo hay que cambiar, se
corrige el script y queda arreglado para siempre; no reescribir el código a mano en cada sync.

Reglas que no se negocian:

- **NUNCA** modificar `Dashboard_Pedidos.html` sin mostrar el PREVIEW y recibir OK explícito.
- **NUNCA** re-sincronizar meses históricos congelados: solo el mes en curso y los meses
  futuros ya armados. En el cambio de mes, cerrar el mes anterior antes de congelarlo.
- **NUNCA** sobreescribir un dato que ya está en el dashboard con un vacío del sheet.
- **NUNCA** saltear la validación (`node scripts/validar.js` + `tbv_sync.py verificar`).
- Los objetivos se leen siempre del sheet, nunca se asumen.

⚠️ `Subir_a_GitHub.bat` hace `git add -A`: commitea **todo** lo que esté modificado en la
carpeta. No dejar cambios a medio hacer cuando se le pide al usuario que publique.

## Estructura de la carpeta

```
Dashboard_Pedidos.html        el dashboard (NO MOVER: la URL pública apunta acá)
Subir_a_GitHub.bat            publicar (NO MOVER: se usa con doble clic)
CLAUDE.md                     este archivo (NO MOVER: Claude Code lo lee de la raíz)
.claude/skills/               instrucciones del proyecto, se cargan solas
scripts/                      los programas que hacen el sync
Historial/                    cómo se llegó hasta acá y por qué
```

`Historial/Historial_Proyecto.md` es el resumen de la etapa Cowork (jul–sep 2026): qué se
construyó, qué criterios se definieron y por qué. **Leerlo antes de cambiar una regla de
negocio** — mucho de lo que parece un detalle arbitrario se decidió por algo. El estado
actual, en cambio, está en este archivo.

## Entorno

| | |
|---|---|
| Sistema | Windows 11 |
| Python | con `openpyxl` — hace la extracción y la escritura |
| Node.js | v24 (`C:\Program Files\nodejs`) — valida el HTML |
| Google Drive | conector MCP, para bajar el XLSX |

Tres cosas propias de este entorno, explicadas en la skill técnica: el conector de Drive
**no puede devolver el XLSX** (pesa ~2,8 MB) y deja el contenido en un archivo aparte; el
HTML está en finales de línea **LF** y hay que preservarlos; y algunas rutas superan el
límite de 260 caracteres de Windows.

## Estado actual (último sync OK: 14/09/2026)

- Mes en curso: Septiembre 2026. Objetivos: Inducidos 150, Rotores 110, Estatores 70.
- Producción Sep (al 14/09): Ind 78, Rot 43, Est 31.
- Congelados: agosto (Ind 255, Rot 33, Est 54), julio, junio, mayo, abril.
- Pedidos: 477 (n máx 477). Badge: "Lun 14/09/2026 09:11".
- Publicado y verificado en GitHub Pages.

## Preferencias del usuario

Erik gestiona la producción del taller. **No es programador.**

1. **Lenguaje simple.** Contar qué pasó y qué significa para su trabajo, no el paso a paso
   técnico. Nada de comandos, rutas ni salidas de consola salvo que los necesite él.
   Mencionar un problema técnico solo si cambia una decisión suya o si tiene que hacer algo.
2. Respuestas concisas y claras, **en español**. No hace falta tanto texto.
3. Ofrecer **checklist de opciones** cuando haya que decidir algo.
4. Cada 5 preguntas, hacer un resumen simple de lo hablado.
5. Antes de generar algo, mostrarlo para revisión antes de desarrollarlo.
