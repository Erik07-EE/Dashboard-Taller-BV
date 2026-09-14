// Validacion del Dashboard Taller BV — paso 8 del flujo de sync.
// Uso:  node scripts/validar.js
// Sale con codigo 1 si algo falla, para poder encadenarlo.
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, '..', 'Dashboard_Pedidos.html');
const html = fs.readFileSync(HTML, 'utf8');

function extraer(nombre) {
  const marca = `const ${nombre}=[`;
  const pos = html.indexOf(marca);
  if (pos < 0) throw new Error(`no se encontro ${nombre}`);
  const start = pos + marca.length - 1;
  let depth = 0, inStr = false, q = '';
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === q) inStr = false;
    } else if (ch === "'" || ch === '"') { inStr = true; q = ch; }
    else if (ch === '[') depth++;
    else if (ch === ']') { if (--depth === 0) return html.slice(start, i + 1); }
  }
  throw new Error(`no cierra ${nombre}`);
}

let fallos = 0;
const check = (ok, msg) => {
  console.log((ok ? '  OK    ' : '  FALLA ') + msg);
  if (!ok) fallos++;
};

// --- parseo, igual que lo hace el navegador ---
const OF_DATA = new Function('return ' + extraer('OF_DATA'))();
const PEDIDOS = new Function('return ' + extraer('PEDIDOS'))();
console.log('PARSEO');
check(Array.isArray(OF_DATA), `OF_DATA parsea (${OF_DATA.length} entradas)`);
check(Array.isArray(PEDIDOS), `PEDIDOS parsea (${PEDIDOS.length} entradas)`);

// El dashboard completa los obj semanales nulos al cargar; replicarlo aca.
OF_DATA.forEach(d => d.semanas.forEach(s => {
  if (s.dias != null && s.obj == null) s.obj = Math.round(d.obj_mensual / d.dias_habiles * s.dias);
}));

console.log('\nMES KEYS');
const keys = [...new Set(OF_DATA.map(e => e.mes_key))].sort();
check(keys.length > 0, `presentes: ${keys.join(', ')}`);

// Mes en curso segun hora AR (UTC-3)
const ahoraAR = new Date(Date.now() - 3 * 3600 * 1000);
const mesActual = `${ahoraAR.getUTCFullYear()}-${String(ahoraAR.getUTCMonth() + 1).padStart(2, '0')}`;
console.log(`\nMES EN CURSO (${mesActual})`);
const cur = OF_DATA.filter(e => e.mes_key === mesActual);
check(cur.length === 3, `los 3 GA presentes (${cur.map(e => e.ga).join(', ') || 'ninguno'})`);
for (const e of cur) {
  const sObj = e.semanas.reduce((a, s) => a + s.obj, 0);
  const sProd = e.semanas.reduce((a, s) => a + s.prod, 0);
  if (e.obj_mensual > 0) {
    check(!e.semanas.every(s => s.obj === 0), `${e.ga}: objetivos semanales no son todos 0`);
    check(sObj === e.obj_mensual, `${e.ga}: Σ obj semanales (${sObj}) == mensual (${e.obj_mensual})`);
  }
  check(sProd === e.prod_total, `${e.ga}: Σ prod semanales (${sProd}) == total (${e.prod_total})`);
}

console.log('\nINTEGRIDAD DE PEDIDOS');
const ns = PEDIDOS.map(p => p.n);
check(new Set(ns).size === ns.length, 'sin n duplicados');
check(ns.every((n, i) => n === i + 1), `n consecutivos 1..${ns[ns.length - 1]}`);
check(PEDIDOS.every(p => p.ga), 'todos con GA');
check(PEDIDOS.every(p => p.codigo), 'todos con codigo');
check(!PEDIDOS.some(p => p.codigo && p.codigo.includes(',')), 'sin codigos con coma');
check(!PEDIDOS.some(p => p.dias_prod != null && p.dias_prod < 0), 'sin dias_prod negativos');
check(PEDIDOS.every(p => !p.fecha_ingreso || /^\d{4}-\d{2}-\d{2}$/.test(p.fecha_ingreso)),
  'fechas de ingreso con formato valido');

console.log('\nBADGE');
const m = html.match(/const _ULTIMO_SYNC='([^']*)'/);
check(!!m, `presente: ${m ? m[1] : 'NO ENCONTRADO'}`);

console.log('\nFINALES DE LINEA');
check(!html.includes('\r\n'), 'el archivo sigue en LF (sin CRLF)');

console.log('\n' + (fallos === 0 ? 'VALIDACION OK — sin errores'
                                 : `VALIDACION CON ${fallos} FALLA(S)`));
process.exit(fallos === 0 ? 0 : 1);
