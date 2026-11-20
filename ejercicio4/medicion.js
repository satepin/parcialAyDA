// =====================================================================
// Herramientas de medición y de formato para la salida
// =====================================================================

// Ejecuta `funcion` varias veces y devuelve su resultado junto con la MEDIANA
// de los tiempos en milisegundos (más estable que una sola corrida).
function medir(funcion, repeticiones = 1) {
  const tiempos = [];
  let resultado;

  for (let r = 0; r < repeticiones; r++) {
    const inicio = process.hrtime.bigint();
    resultado = funcion();
    const nanosegundos = process.hrtime.bigint() - inicio;
    tiempos.push(Number(nanosegundos) / 1e6);
  }

  tiempos.sort((a, b) => a - b);
  const mediana = tiempos[Math.floor(tiempos.length / 2)];
  return { resultado, ms: mediana };
}

// Generador de números pseudoaleatorios entre 0 y 1 con SEMILLA (mulberry32).
// Con la misma semilla da siempre la misma secuencia, así los pivotes
// "aleatorios" son reproducibles y las comparaciones dan igual en cada corrida.
function generadorAleatorio(semilla = 12345) {
  let estado = semilla >>> 0;
  return function siguiente() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Formato ---

// 1234567 → "1.234.567"
function conPuntos(numero) {
  return Math.round(numero).toLocaleString('es-AR');
}

// 12.3 → "12.30 ms"   ·   2450 → "2.45 s"
function formatearTiempo(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms.toFixed(2)} ms`;
}

function formatearBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// Tabla de texto con columnas alineadas: la primera a la izquierda, el resto
// a la derecha (los números se leen mejor así).
function imprimirTabla(encabezados, filas) {
  const anchos = encabezados.map((encabezado, columna) => {
    const largos = filas.map((fila) => String(fila[columna]).length);
    return Math.max(encabezado.length, ...largos);
  });

  const alinear = (valor, columna) => {
    const texto = String(valor);
    return columna === 0 ? texto.padEnd(anchos[columna]) : texto.padStart(anchos[columna]);
  };
  const imprimirFila = (celdas) => {
    console.log('  ' + celdas.map(alinear).join('  │  '));
  };

  imprimirFila(encabezados);
  console.log('  ' + anchos.map((ancho) => '─'.repeat(ancho)).join('──┼──'));
  filas.forEach(imprimirFila);
}

function titulo(texto) {
  const linea = '='.repeat(78);
  console.log(`\n${linea}\n${texto}\n${linea}`);
}

function subtitulo(texto) {
  const relleno = '-'.repeat(Math.max(0, 73 - texto.length));
  console.log(`\n--- ${texto} ${relleno}`);
}

module.exports = {
  medir,
  generadorAleatorio,
  conPuntos,
  formatearTiempo,
  formatearBytes,
  imprimirTabla,
  titulo,
  subtitulo,
};
