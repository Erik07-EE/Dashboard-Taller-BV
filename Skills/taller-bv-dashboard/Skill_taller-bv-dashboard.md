---
name: "taller-bv-dashboard"
description: "Actualizar el Dashboard de Producción del Taller BV (Electroestrada). Usar cuando el usuario diga \"actualizar dashboard\", \"actualizar producción\", \"sync dashboard\", \"sincronizar pedidos\" o variantes. Descarga el Google Sheet como XLSX, extrae producción y pedidos, muestra un PREVIEW, aplica cambios al HTML, actualiza el badge y valida. Complementaria: taller-bv-dashboard-tech (código)."
---

# SKILL: taller-bv-dashboard

Instrucciones principales para actualizar el Dashboard Taller BV.

## Contexto del Proyecto

- **Proyecto:** Taller BV — Electroestrada
- **Dashboard:** `C:\Users\Estrada\Desktop\Claude\Reportes\Taller BV\Dashboard_Pedidos.html`
- **Google Sheet fileId:** `1iO9pLENWSmQAv9VlJsmz-nQsa88NqdVJ` (exportar como XLSX)
- **GitHub Pages:** https://Erik07-EE.github.io/Dashboard-Taller-BV/Dashboard_Pedidos.html
- **Script subir:** `Subir_a_GitHub.bat` (doble clic en Explorer)
- **Git user:** erik@electroestrada.com.ar / Erik07-EE
- **Skills:** taller-bv-dashboard (esta) + taller-bv-dashboard-tech (código exacto)

## Estructura del XLSX

XLSX binario (no CSV). Hojas: `OF-IND`, `OF-ROT`, `OF-EST`, `Urgentes`. Leer con
`openpyxl.load_workbook(path, data_only=True)`.

- **Fila 1:** objetivos. `Objetivo <Mes>` (mensual, valor en `col+1`) y `Obj. S.1`…`Obj. S.5`.
  Los semanales van ANTES del label mensual (entre el objetivo del mes anterior y el de este mes).
- **Detección de mes automática:** sincronizar el **mes en curso** (fecha AR) + **meses futuros
  ya armados** (ej. agosto). NO hardcodear el mes. NO re-sincronizar meses históricos congelados.
- **Mes armado sin objetivo:** bloque vacío (obj 0, semanas [], codigos []); se completa solo
  cuando se carga el objetivo/producción.
- **Semana de 1 día sin rótulo:** si S1 o S5 tiene un solo día hábil, no lleva rótulo `Obj. S.x`;
  el objetivo queda como valor suelto en fila 1 de esa columna. Se lee posicional y se valida con
  `Σ semanales == objetivo mensual` (ver skill técnica).
- **Fila 2:** fechas datetime (un día hábil por columna).
- **Filas 3+:** por código. Excluir código "-"/vacío (son totales). Estatores: ignorar 30/04.
- **Obj. semanales** vienen decimales → redondear al entero.
- **Códigos con coma** (ej. `IB2903,10`) → normalizar a punto (`IB2903.10`).

### Columnas hoja Urgentes

| Col | Campo | Col | Campo |
|-----|-------|-----|-------|
| 1 | N | 8 | Entrega sol. |
| 2 | Ingreso | 12 | Reclamo |
| 3 | GA | 13 | Observación |
| 4 | Código | 14 | Entrega real |
| 5 | Condición | 16 | Días prod. (P) |
| 6 | Cliente | 17 | Demora (Q) |
| 7 | Días obj. (G) | | |

## Flujo Obligatorio

1. Descargar el Sheet con `download_file_content` (fileId de arriba).
2. Decodificar base64 → `/tmp/urgentes.xlsx` (verificar header PK).
3. Leer OF_DATA y PEDIDOS del dashboard con Node.js.
4. Extraer producción + pedidos con openpyxl (detección de mes automática — ver skill técnica).
5. **Mostrar PREVIEW y ESPERAR OK.**
6. Aplicar cambios al HTML (string replacement quirúrgico).
7. Actualizar badge con `re.sub`.
8. Validar con Node.js (sin errores).
9. Pedir correr `Subir_a_GitHub.bat`.
10. Verificar que el badge en GitHub Pages coincida con el local.

## Formato del PREVIEW

```
PREVIEW — Cambios detectados [fecha]
OBJETIVOS MENSUALES: GA  Dashboard  Sheet  OK/DIFF
PRODUCCION [MES]: GA  Actual->Nuevo  (semanas)
PEDIDOS NUEVOS: n=XX [ga] [codigo] [cond] sol
PEDIDOS ACTUALIZADOS: n=XX [cod] campo: viejo->nuevo
¿Aplicar? (OK / ajustes)
```

## Reglas Críticas

- NUNCA aplicar sin PREVIEW confirmado.
- NUNCA asumir objetivos — leerlos del sheet (fila 1). Semanales al entero.
- NUNCA contar filas con código "-". NUNCA incluir la columna 30/04 en Estatores.
- NUNCA sobreescribir datos existentes del dashboard con vacíos del sheet.
- NUNCA usar `html.find` para el badge — usar `re.sub`.
- NUNCA re-sincronizar meses históricos congelados; solo mes en curso + futuros armados.
- NUNCA omitir la validación Node.js.
- Normalizar coma→punto en códigos.
- `esSiCambiar` (reclamo contiene "cambiar") → excluir de métricas.
- `dias_prod` negativo = artifact → guardar como `null`.
- Validar `Σ objetivos semanales == objetivo mensual` de cada mes.
- **Sincronizar la carpeta del proyecto** (Memoria/Prompt/Skills) tras cada cambio de
  memoria/prompt/skills y regenerar sus PDF.

## Métricas (cómo se calculan)

- **Días prom. y % prom. → SOLO sobre pedidos ENTREGADOS** (con fecha de entrega real); los
  en proceso no cuentan; sin entregados muestra "—". Helpers: `entregadoP(p)`, `dpProm(arr)`.
- **Días prod. prom.:** promedio simple de `dias_prod` de entregados (sin Si-Cambiar).
- **% prom. (General y solapas GA):** `(días prom − OBJ_SERV) / OBJ_SERV`, promedio sin redondear.
  Verde = adelanto, rojo = retraso.
- **avgDemDP** (% por condición): `avg((dias_prod − dias_objetivo)/dias_objetivo)` de entregados.
- **% Servicio (el premio de finanzas):** `avgDem` = promedio de la demora de entrega
  (`demora efectiva`; incluye estimados de vencidos sin fecha real).
- **Demora:** `dias_habiles(entrega_sol, entrega_real) / dias_objetivo`. Negativo = adelanto.

## Funciones interactivas del dashboard

- **Selector "Obj. servicio" (`OBJ_SERV`, 3/2/1, default 3, SIMULACIÓN):** recalcula en vivo
  el **% prom** `(díasprom−N)/N` y el **% Servicio**. Para el % Servicio, objetivo efectivo de
  cada pedido = `G − (3 − N)` (baja el base 3, mantiene el extra de especiales), recomputando la
  fecha comprometida = ingreso + objetivo efectivo (días hábiles). Con N=3 = valores oficiales.
- **Detalle "Ver cálculo" (% Servicio):** columnas GA / Código / Días (obj. efectivo) / Días prom.
  (col P) / % Servicio (recalculado). Ordenado por GA → alfabético por código → especiales al final.
  Scroll acotado (~10 filas) con cabecera y total fijos.
- **Encabezado sticky:** header + toolbar (`.topbar`) quedan fijos arriba al scrollear.
