---
name: taller-bv-dashboard
description: Actualizar el Dashboard de Producción del Taller BV (Electroestrada). Usar cuando el usuario diga "actualizar dashboard", "actualizar producción", "sync dashboard", "sincronizar pedidos" o variantes. Descarga el Google Sheet como XLSX, extrae producción y pedidos, muestra un PREVIEW, aplica los cambios al HTML, actualiza el badge y valida. Complementaria: taller-bv-dashboard-tech.
---

# SKILL: taller-bv-dashboard

Flujo para sincronizar el Dashboard Taller BV. El trabajo pesado lo hacen los scripts
de `scripts/`; esta skill es el procedimiento y las reglas de decisión.

## Contexto

| Dato | Valor |
|---|---|
| Dashboard | `Dashboard_Pedidos.html` (raíz del proyecto) |
| Google Sheet fileId | `1iO9pLENWSmQAv9VlJsmz-nQsa88NqdVJ` |
| GitHub Pages | https://Erik07-EE.github.io/Dashboard-Taller-BV/Dashboard_Pedidos.html |
| Publicar | `Subir_a_GitHub.bat` (doble clic) |
| Git | erik@electroestrada.com.ar / Erik07-EE |

Entorno: **Windows + Claude Code**. Python (con openpyxl) y Node.js ya están instalados.
Idioma de trabajo: **español**.

## Flujo

### 1. Descargar el Sheet

Llamar `download_file_content` con el fileId de arriba.

**La llamada va a fallar** con `result (N characters) exceeds maximum allowed tokens`.
**Eso es lo esperado, no es un problema**: el XLSX pesa ~2,8 MB y en base64 supera el
límite de respuesta. El error indica la ruta de un `.txt` donde quedó volcado el
contenido completo. Copiar esa ruta — es el `--dump` del paso siguiente.

No intentar `read_file_content` ni reintentar la descarga: siempre va a fallar igual.

### 2. PREVIEW

```
python scripts/tbv_sync.py preview --dump "<ruta del .txt del paso 1>"
```

Decodifica el XLSX (verifica header PK), extrae producción y pedidos, compara contra el
dashboard e imprime el PREVIEW. **No modifica nada.**

### 3. Mostrar el PREVIEW y ESPERAR OK

Presentar los cambios al usuario y **esperar confirmación explícita**. Nunca aplicar sin OK.

Revisar el PREVIEW antes de presentarlo y **señalar lo que parezca un error de carga**
en el Sheet — por ejemplo un pedido cuyo GA no coincide con el prefijo del código
(`E…` = Estatores, `I…` = Inducidos, `R…` = Rotores). No corregirlo por cuenta propia:
esos errores se arreglan **en el Sheet**, y después se vuelve al paso 1.

### 4. Aplicar

```
python scripts/tbv_sync.py aplicar
```

Escribe el HTML y actualiza el badge. Deja un backup en `%TEMP%\tbv-sync\`.

### 5. Validar

```
node scripts/validar.js
python scripts/tbv_sync.py verificar
```

`validar.js` parsea el HTML como lo haría el navegador y chequea integridad.
`verificar` compara campo por campo contra el estado previo e informa si se tocó
algún mes congelado. **Ambos deben pasar sin fallas.**

Si algo falla, restaurar el backup desde `%TEMP%\tbv-sync\Dashboard_Pedidos.BACKUP.html`
y revisar antes de seguir.

### 6. Publicar

Pedirle al usuario que corra `Subir_a_GitHub.bat` (doble clic).

> ⚠️ El `.bat` hace `git add -A`: commitea **todo** lo modificado en la carpeta. No dejar
> cambios a medio hacer en el repo cuando se le pide al usuario que publique.

### 7. Verificar GitHub Pages

Abrir la URL de Pages y confirmar que `_ULTIMO_SYNC`, la cantidad de pedidos y los totales
del mes coinciden con el local.

## Reglas críticas

- **NUNCA** aplicar sin PREVIEW confirmado por el usuario.
- **NUNCA** re-sincronizar meses históricos congelados; solo mes en curso + futuros armados.
- **NUNCA** asumir objetivos: se leen del sheet (fila 1). Semanales al entero.
- **NUNCA** sobreescribir datos existentes del dashboard con vacíos del sheet.
- **NUNCA** omitir la validación.
- En el cambio de mes, hacer un **cierre final del mes anterior** antes de congelarlo.
- El dashboard abre por defecto en el último mes cargado.

## Métricas (cómo se calculan)

- **Días prom. y % prom. → SOLO sobre pedidos ENTREGADOS** (con fecha de entrega real);
  los en proceso no cuentan; sin entregados muestra "—". Helpers: `entregadoP(p)`, `dpProm(arr)`.
- **Días prod. prom.:** promedio simple de `dias_prod` de entregados (sin Si-Cambiar).
- **% prom.** (General y solapas GA): `(días prom − OBJ_SERV) / OBJ_SERV`, sin redondear.
  Verde = adelanto, rojo = retraso.
- **avgDemDP** (% por condición): `avg((dias_prod − dias_objetivo)/dias_objetivo)` de entregados.
- **% Servicio** (el premio de finanzas): `avgDem` = promedio de la demora de entrega
  (incluye estimados de vencidos sin fecha real).
- **Demora:** `dias_habiles(entrega_sol, entrega_real) / dias_objetivo`. Negativo = adelanto.
- `esSiCambiar` (reclamo contiene "cambiar") → excluido de métricas.

## Funciones interactivas del dashboard

- **Selector "Obj. servicio"** (`OBJ_SERV`, 3/2/1, default 3, **simulación**): recalcula en
  vivo el `% prom` y el `% Servicio`. Para el % Servicio, objetivo efectivo de cada pedido =
  `G − (3 − N)`, recomputando la fecha comprometida = ingreso + objetivo efectivo (días
  hábiles). Con N=3 son los valores oficiales.
- **Detalle "Ver cálculo"** (% Servicio): columnas GA / Código / Días (obj. efectivo) /
  Días prom. (col P) / % Servicio. Ordenado por GA → alfabético → especiales al final.
- **Encabezado sticky:** header + toolbar (`.topbar`) quedan fijos al scrollear.
