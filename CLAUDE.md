# CLAUDE.md — Proyecto Dashboard Taller BV (Electroestrada)

Contexto para continuar el trabajo del dashboard desde Claude Code.
La conversación original se hizo en Cowork; este archivo resume el estado y las reglas.

## Qué es

Dashboard de producción del Taller BV (motores eléctricos): producción por GA
(Inducidos/Rotores/Estatores) y pedidos urgentes. Se genera un único HTML y se publica en
GitHub Pages.

- Dashboard: `Dashboard_Pedidos.html` (en esta carpeta)
- Publicar: `Subir_a_GitHub.bat` (doble clic)
- GitHub Pages: https://Erik07-EE.github.io/Dashboard-Taller-BV/Dashboard_Pedidos.html
- Google Sheet fileId: `1iO9pLENWSmQAv9VlJsmz-nQsa88NqdVJ` (exportar como XLSX)
- Git: erik@electroestrada.com.ar / Erik07-EE

## Cómo trabajar (IMPORTANTE)

Las skills con TODO el código y las reglas están en `Skills/`:
- `Skills/taller-bv-dashboard/Skill_taller-bv-dashboard.md` (flujo + reglas + métricas)
- `Skills/taller-bv-dashboard-tech/Skill_taller-bv-dashboard-tech.md` (código exacto de
  extracción/aplicación/validación)

Seguir SIEMPRE ese código y estas reglas:
- Al decir "actualizar dashboard": bajar el Sheet (fileId de arriba) como XLSX → extraer con
  openpyxl → **mostrar PREVIEW y esperar OK** → aplicar al HTML → actualizar badge (re.sub) →
  validar con Node.js → pedir correr `Subir_a_GitHub.bat` → verificar GitHub Pages.
- Detección de mes automática: sincronizar el **mes en curso** + meses futuros ya armados.
  NUNCA re-sincronizar meses históricos congelados. En el cambio de mes, hacer un **cierre
  final del mes anterior** antes de congelarlo.
- Objetivos: leerlos del sheet (fila 1). Semanales al entero. Semana de 1 día sin rótulo se
  lee posicional; validar `Σ semanales == objetivo mensual`.
- No sobreescribir datos existentes con vacíos. Normalizar coma→punto en códigos.
  dias_prod negativo → null. Estatores: ignorar columna 30/04. No contar filas con código "-".
- Métricas: Días prom. y % prom. solo sobre ENTREGADOS. % prom = (días prom − OBJ_SERV)/OBJ_SERV.
  % Servicio = avgDem (demora de entrega). Selector "Obj. servicio" (3/2/1, default 3, simulación)
  recalcula % prom y % Servicio (objetivo efectivo = G−(3−N)).
- El dashboard abre por defecto en el último mes cargado. Encabezado (header+toolbar) sticky.

## Estado actual (último sync OK: 07/09/2026)

- Mes en curso: Septiembre 2026. Objetivos Sep: Inducidos 150, Rotores 110, Estatores 70.
- Producción Sep (al 07/09): Ind 43, Rot 10, Est 16.
- Agosto congelado: Ind 255, Rot 33, Est 54. Julio/junio/mayo/abril congelados.
- Pedidos: 438 (n máx 438). Badge: "Lun 07/09/2026 08:51".
- PENDIENTE: sync del Sheet del 11/09 (quedó sin aplicar por un problema del entorno Cowork).

## Notas de proceso

- Respuestas concisas, en español. Ofrecer checklist de opciones.
- NUNCA modificar `Dashboard_Pedidos.html` sin PREVIEW + OK explícito.
- Reflejar cambios de skills/instrucciones también en los archivos de esta carpeta
  (`Skills/`, `Prompt/Instrucciones_Proyecto.docx`) y regenerar sus PDF.
