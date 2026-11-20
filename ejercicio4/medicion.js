// Utilidades de medición empírica: cronómetro, repeticiones y formato.

// Ejecuta fn() `reps` veces y devuelve { resultado, ms } con la MEDIANA de los
// tiempos (más estable que una sola corrida o que el promedio).
function medir(fn, reps = 1) {
  const tiempos = [];
  let resultado;
  for (let r = 0; r < reps; r++) {
    const t0 = process.hrtime.bigint();
    resultado = fn();
    tiempos.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  tiempos.sort((a, b) => a - b);
  return { resultado, ms: tiempos[Math.floor(tiempos.length / 2)] };
}

const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms.toFixed(2)} ms`);
const fmtN = (x) => Math.round(x).toLocaleString('es-AR');
const fmtBytes = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`);

// Generador pseudoaleatorio con semilla (mulberry32), para que los pivotes
// aleatorios den siempre los mismos resultados y las corridas sean reproducibles.
function rngConSemilla(semilla = 12345) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tabla(encabezados, filas) {
  const anchos = encabezados.map((h, c) => Math.max(h.length, ...filas.map((f) => String(f[c]).length)));
  const linea = (celdas) => '  ' + celdas.map((x, c) => (c === 0 ? String(x).padEnd(anchos[c]) : String(x).padStart(anchos[c]))).join('  │  ');
  console.log(linea(encabezados));
  console.log('  ' + anchos.map((w) => '─'.repeat(w)).join('──┼──'));
  filas.forEach((f) => console.log(linea(f)));
}

const titulo = (t) => console.log('\n' + '='.repeat(78) + '\n' + t + '\n' + '='.repeat(78));
const subtitulo = (t) => console.log('\n--- ' + t + ' ' + '-'.repeat(Math.max(0, 73 - t.length)));

module.exports = { medir, fmtMs, fmtN, fmtBytes, rngConSemilla, tabla, titulo, subtitulo };
