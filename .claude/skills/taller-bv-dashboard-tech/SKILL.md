---
name: taller-bv-dashboard-tech
description: Skill técnica complementaria de taller-bv-dashboard. Estructura del XLSX (objetivos semanales antes del label mensual, semana de 1 día sin rótulo, columnas de la hoja Urgentes), formato de OF_DATA y PEDIDOS en el HTML, y las trampas del entorno Windows (finales de línea LF, límite de 260 caracteres en rutas, orden canónico de claves). Usar junto con la skill principal al sincronizar o al modificar los scripts de sync.
---

# SKILL: taller-bv-dashboard-tech

Detalle técnico del sync. La lógica está implementada en `scripts/tbv_sync.py` y
`scripts/validar.js` — **modificar los scripts, no reescribir el código a mano en cada sync.**

## Scripts

| Comando | Qué hace |
|---|---|
| `python scripts/tbv_sync.py preview --dump <txt>` | Decodifica el XLSX, extrae, compara, imprime el PREVIEW. No escribe nada. |
| `python scripts/tbv_sync.py aplicar` | Aplica al HTML + badge. Backup en `%TEMP%\tbv-sync\`. |
| `python scripts/tbv_sync.py verificar` | Diff semántico contra el estado previo. |
| `node scripts/validar.js` | Parsea el HTML como el navegador y chequea integridad. Sale 1 si falla. |

El caché intermedio (`sheet.json`, `dash.json`, `urgentes.xlsx`, backup) vive en
`%TEMP%\tbv-sync\`, fuera del repo.

## Trampas del entorno (Windows + Claude Code)

Las tres costaron un sync entero. No repetirlas:

1. **Finales de línea.** `Dashboard_Pedidos.html` está en **LF**. Python en Windows lo
   reescribe como CRLF si se abre sin `newline=''`, y el diff pasa de ~80 a ~1500 líneas.
   Siempre `open(..., newline='')` para leer y escribir. `validar.js` lo chequea.

2. **Rutas de más de 260 caracteres.** El volcado del conector queda en
   `~/.claude/projects/<slug-largo>/.../tool-results/…txt`, que supera el `MAX_PATH` de
   Windows: Git Bash la abre, pero Python tira `FileNotFoundError`. `tbv_sync.py` lo
   resuelve con el prefijo `\\?\` (función `ruta_larga`).

3. **Orden de claves.** Serializar los pedidos en un orden distinto al del archivo marca
   como modificados registros cuyos valores no cambiaron. El orden canónico es `K_PED`
   en `tbv_sync.py`. Por eso `verificar` compara **valores**, no texto.

Además: el conector de Drive **nunca** va a devolver el XLSX en la respuesta (pesa ~2,8 MB;
en base64 son ~3,7 M de caracteres). El error con la ruta del volcado es el camino normal.

## Estructura del XLSX

Hojas relevantes: `OF-IND`, `OF-ROT`, `OF-EST`, `Urgentes`.
Leer con `openpyxl.load_workbook(path, data_only=True)`.

- **Fila 1:** objetivos. `Objetivo <Mes>` (mensual, valor en `col+1`) y `Obj. S.1`…`Obj. S.5`.
- **Fila 2:** fechas datetime (un día hábil por columna).
- **Filas 3+:** una por código. Excluir código `-`/vacío (son totales).

### Bloques de mes

Los meses van uno al lado del otro. Para cada mes, en la fila 1, los objetivos **semanales
van ANTES del label mensual** (ocupan las columnas de las fechas de ese mes) y el label
`Objetivo <Mes>` va al final del bloque.

Para leer los semanales hay que mirar el rango **entre el `Objetivo` del mes anterior y el
de este mes** — NO escanear hacia adelante, porque agarraría los del mes siguiente.

**Semana de 1 día sin rótulo:** si S1 o S5 tiene un solo día hábil, no lleva rótulo
`Obj. S.x` y el objetivo queda como valor suelto en la fila 1 de esa columna. Se lee
posicionalmente (primer valor numérico de la fila 1 de esa semana que no venga después de
un `Prod. S.`) y se valida con `Σ semanales == objetivo mensual`; si no cuadra y hay una
sola semana sin rótulo, se corrige con el residual.

### Detección de meses

Mes en curso (fecha AR, UTC-3) + meses futuros ya armados. Nunca re-sincronizar históricos.
Un mes con columnas pero sin objetivo entra como bloque vacío (obj 0, semanas `[]`,
codigos `[]`) y se completa cuando se cargan los números.

### Reglas de datos

- Objetivos semanales vienen decimales → redondear al entero.
- **Normalización de códigos** (`normalizar_codigo` en `tbv_sync.py`): coma decimal → punto
  (`IB2903,10` → `IB2903.10`) y dos puntos → guion (`ESP:0014` → `ESP-0014`).
  Se aplica solo a lo que entra: los códigos ya guardados en meses congelados **no se tocan**,
  por eso conviven formas viejas como `IESP(ID:I-394)` o `E:208` con las nuevas. Decidido
  con el usuario el 14/09/2026.
- Estatores: ignorar la columna 30/04 (artifact conocido).
- `dias_prod` negativo = error de fórmula → guardar `null`.

### Columnas de la hoja Urgentes

| Col | Campo | Col | Campo |
|-----|-------|-----|-------|
| 1 | N | 8 | Entrega sol. |
| 2 | Ingreso | 12 | Reclamo |
| 3 | GA | 13 | Observación |
| 4 | Código | 14 | Entrega real |
| 5 | Condición | 16 | Días prod. (P) |
| 6 | Cliente | 17 | Demora (Q) |
| 7 | Días obj. (G) | | |

## Formato en el HTML

Dos arrays JS-literal: claves sin comillas, strings con comilla simple, `null` para vacíos,
una entrada por línea con 2 espacios de indentación.

```js
const OF_DATA=[
  {ga:'Inducidos',mes_key:'2026-09',mes_label:'Septiembre 2026',obj_mensual:150,dias_habiles:22,prod_total:78,semanas:[{num:1,dias:5,obj:28,prod:43}],codigos:[{codigo:'IB1910.20',categoria:'B',cantidad:9}]}
];

const PEDIDOS=[
  {n:1,ga:'Inducidos',codigo:'IB2316.20',condicion:'Reclamos',cliente:'C0096',reclamo:'Si - Cambiar',observacion:'-',fecha_ingreso:'2026-05-07',dias_objetivo:3,entrega_sol:'2026-05-12',fecha_entrega_real:'2026-05-12',dias_prod:3,demora:0}
];
```

OF_DATA va ordenado por `mes_key` y luego GA (Inducidos, Rotores, Estatores).
Las semanas sin `obj` las completa el propio dashboard:

```js
OF_DATA.forEach(d=>{d.semanas.forEach(s=>{if(s.dias!=null && s.obj==null)s.obj=Math.round(d.obj_mensual/d.dias_habiles*s.dias);});});
```

## Badge

La línea **no termina en punto y coma**, por eso se reemplaza con `re.sub` y nunca con
`html.find`:

```python
html = re.sub(r"const _ULTIMO_SYNC='[^']*'", f"const _ULTIMO_SYNC='{fecha}'", html)
```

Formato: `Lun 14/09/2026 09:11` (día abreviado en español, hora AR).

## No sobreescribir con vacíos

```python
def es_cambio(campo, v_dash, v_sheet):
    if v_sheet is None or v_dash == v_sheet: return False
    if campo == 'demora' and v_dash is not None and round(float(v_dash),2)==round(float(v_sheet),2): return False
    if campo == 'cliente' and str(v_dash or '').lower()==str(v_sheet or '').lower(): return False
    if campo == 'observacion' and str(v_dash or '').strip()==str(v_sheet or '').strip(): return False
    return True
```

## Historial de criterios

- **23/07/2026** — `% prom` en Urgentes: tarjeta General y solapas GA usan el mismo criterio,
  `(días prom − OBJ_SERV) / OBJ_SERV`, sin redondear. Antes General usaba `avgDemDP`.
  No afecta al `% Servicio`, que usa `avgDem`.
- **29/07/2026** — `Días prod. prom.`, `% prom.` y `avgDemDP` se calculan **solo sobre
  entregados**. Evita mostrar adelanto/retraso de artículos aún en fabricación.
- **04/08/2026** — El selector `OBJ_SERV` (3/2/1) también recalcula el `% Servicio`:
  objetivo efectivo = `G − (3 − OBJ_SERV)`. En `demoraEfectiva`, con `OBJ_SERV===3` usa los
  valores del sheet; si no, recalcula con `_bdays`/`_addBdays`. Encabezado sticky (`.topbar`).
