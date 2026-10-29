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

### Publicar

**Desde el 29/10/2026 publica Claude** (`git add -A` + `commit` + `push origin main`), tras
el OK del usuario. Antes de subir, mostrarle qué archivos van.

Motivo: con el proyecto en Drive, el Control Inteligente de Aplicaciones de Windows 11
bloquea `Subir_a_GitHub.bat` por ser un script sin firmar en una unidad de red. El `.bat`
sigue en la carpeta y funciona si se lo ejecuta desde un disco local.

⚠️ `git add -A` sube **todo** lo que esté modificado en la carpeta: no dejar cambios a medio
hacer al momento de publicar.

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

⚠️ **El proyecto vive en una unidad compartida de Google Drive** (`G:\Unidades compartidas\…`)
desde el 26/10/2026. Dos cuidados:

- La carpeta tiene que estar marcada como **"Acceso sin conexión"** en Drive. Si los archivos
  quedan solo en la nube, git no los encuentra y `Subir_a_GitHub.bat` falla.
- Drive sincroniza en segundo plano y **puede corromper la carpeta `.git`**. Si eso pasa, no
  se pierde nada: está todo en GitHub y se recupera clonando el repositorio de nuevo.

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

## Estado actual (último sync OK: 29/10/2026)

- Mes en curso: Octubre 2026. Objetivos: Inducidos 160, Rotores 50, Estatores 90.
  (Cambiaron fuerte respecto a septiembre: Rotores bajó de 110 a 50, Estatores subió de 70 a 90.)
- Producción Oct (al 29/10): Ind 150, Rot 57, Est 74. (Rotores ya superó el objetivo.)
- **Septiembre cerrado y cumplido:** Ind 178/150, Rot 121/110, Est 76/70 (114% del total).
- Congelados: septiembre, agosto (Ind 255, Rot 33, Est 54), julio, junio, mayo, abril.
- Pedidos: 608 (n máx 609, con el **#509 anulado** → hueco esperado en la numeración).
- **Objetivo de servicio: 2 días** (bajó de 3 el 20/10/2026). En el HTML es la constante
  `OBJ_BASE`; si vuelve a cambiar, se toca solo ese número.
- Publicado y verificado en GitHub Pages.

**Cierre de mes automático:** durante los primeros 10 días del mes, el sync incluye también
el mes anterior (`DIAS_CIERRE` en `tbv_sync.py`), para no perder las unidades que se cargan
sobre el final. Para forzar un mes puntual: `tbv_sync.py preview --dump ... --mes 2026-09`.

## Preferencias del usuario

Erik gestiona la producción del taller. **No es programador.**

1. **Lenguaje simple.** Contar qué pasó y qué significa para su trabajo, no el paso a paso
   técnico. Nada de comandos, rutas ni salidas de consola salvo que los necesite él.
   Mencionar un problema técnico solo si cambia una decisión suya o si tiene que hacer algo.
2. Respuestas concisas y claras, **en español**. No hace falta tanto texto.
3. Ofrecer **checklist de opciones** cuando haya que decidir algo.
4. Cada 5 preguntas, hacer un resumen simple de lo hablado.
5. Antes de generar algo, mostrarlo para revisión antes de desarrollarlo.
