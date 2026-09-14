# Historial del Proyecto — Dashboard Taller BV

Resumen del trabajo hecho sobre el dashboard, de principio a fin.
(Etapa Cowork: 10/07/2026 → 14/09/2026. Después el trabajo siguió en Claude Code.)

## En una frase

Pasamos de un dashboard que se actualizaba "a mano" a un flujo confiable y repetible:
se sincroniza el Google Sheet con el dashboard, se muestra un preview, se aplica, se valida
y se publica en GitHub Pages — con reglas claras y varias mejoras pensadas para el taller.

## Lo que se construyó (en orden)

1. **Sincronización mes a mes.** Cada "actualizar dashboard" baja el Sheet, extrae producción
   y pedidos, muestra un PREVIEW, aplica y actualiza el badge de fecha. Se hicieron muchos
   syncs entre julio y septiembre.

2. **Orden y respaldo.** Se limpió la carpeta (archivos de más, git corrupto), se unificó la
   documentación en un solo archivo y se mantuvieron las skills + PDF como respaldo.

3. **Detección automática de mes.** El sync detecta solo el mes en curso y suma los meses
   futuros ya cargados. Los meses históricos quedan "congelados" y no se vuelven a tocar.
   En cada cambio de mes se hace un **cierre final del mes anterior** (rescató, por ejemplo,
   14 unidades de agosto que se cargaron los últimos días).

4. **Criterio del "% prom." unificado (23/07).** La tarjeta General y las solapas por GA usan
   el mismo cálculo: `(días prom − 3) / 3`.

5. **Métricas solo sobre entregados (29/07).** "Días prom." y "% prom." se calculan solo con
   pedidos ya entregados; los que están en proceso no cuentan (antes mostraban un adelanto
   engañoso).

6. **Selector "Obj. servicio" (3/2/1).** Un desplegable de simulación (arranca en 3) que
   recalcula en vivo el **% prom** y el **% Servicio** (el premio que mira finanzas). Sirvió
   para responder "¿cuánto cae el premio si el objetivo fuese 2 días?" sin tocar los datos.
   - % Servicio con objetivo base 2 = bajar 1 día a cada objetivo de la columna G
     (manteniendo el extra de los especiales). Julio pasaba de −45,9% a −19,6% de adelanto.

7. **Detalle "Ver cálculo" rediseñado.** Columnas GA / Código / Días / Días prom. / % Servicio,
   ordenado por GA → alfabético → especiales al final, con scroll acotado y total fijo.
   Recalcula con el selector.

8. **Encabezado fijo (sticky)** y **el dashboard abre en el último mes cargado**.

## Arreglos y aprendizajes clave

- **Registro roto (n=48):** una entrega con fecha anterior al ingreso daba días negativos y
  distorsionaba las métricas; se corrigió en el sheet.
- **Objetivos semanales:** van ANTES del rótulo mensual; si una semana tiene 1 solo día, no
  lleva rótulo y el valor se lee "posicional". Se agregó una validación: la suma de las
  semanas tiene que dar el objetivo mensual (avisa si no cuadra).
- **Normalización:** códigos con coma (IB2903,10) → punto; dos puntos (ESP:0014) → guion.
- **Agosto y septiembre** se agregaron como meses nuevos cuando aparecieron en el sheet, y sus
  objetivos se completaron cuando los cargaste.

## Estado al cierre de la etapa Cowork

- Mes en curso: Septiembre 2026 (objetivos 150 / 110 / 70).
- Meses congelados: agosto (255/33/54), julio, junio, mayo, abril.
- El trabajo continuó en Claude Code (por un problema temporal del entorno de Cowork).
  El estado más actual está en `CLAUDE.md`.

## Cómo se trabaja (referencia rápida)

Decir "actualizar dashboard" → baja el Sheet (fileId `1iO9pLENWSmQAv9VlJsmz-nQsa88NqdVJ`) →
PREVIEW → OK → aplica → valida → correr `Subir_a_GitHub.bat` → verificar GitHub Pages.
Todo el detalle vive en las skills de la carpeta.
