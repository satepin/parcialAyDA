// Ejercicio 3 — Búsqueda de palabras en una sopa de letras
// Uso: node sopa.js   (o desde el menú: node index.js)
//
// 1. Algoritmo elegido: Brute Force String Match (U3, Fuerza Bruta), extendido
//    a las 8 direcciones (horizontal, vertical y diagonales, en ambos sentidos).
//    Motivos:
//     - Es el algoritmo de búsqueda de patrones que da la teoría (U3).
//     - Es exhaustivo: garantiza encontrar TODAS las apariciones.
//     - La matriz es chica (20 × 20 = 400 celdas) y las palabras cortas (5 letras),
//       así que el costo O(n² · m) es despreciable y no justifica una técnica más compleja.
// 2. Palabras: ARBOL, HEAPS, SORTS, NODOS, GRAFO.
// 3. Adición: buscar palabras nuevas con el mismo algoritmo.
//     - Desde el menú o en una terminal: se piden por teclado (Enter vacío termina).
//     - Por línea de comandos: node sopa.js DFS RED  (sin preguntar nada).

const { MATRIZ, PALABRAS } = require('./matriz');
const { DIRECCIONES, buscarPalabra } = require('./fuerzaBruta');

const titulo = (t) => console.log('\n' + '='.repeat(64) + '\n' + t + '\n' + '='.repeat(64));
const pos = ([f, c]) => `(${f + 1},${c + 1})`;

function imprimirMatriz(matriz, marcadas, soloFilasMarcadas = false) {
  const C = matriz[0].length;
  console.log('     ' + Array.from({ length: C }, (_, c) => String(c + 1).padStart(3)).join(''));
  matriz.forEach((fila, f) => {
    if (soloFilasMarcadas && !fila.some((_, c) => marcadas.has(`${f},${c}`))) return;
    const celdas = fila.map((letra, c) => {
      if (!marcadas) return letra.padStart(3);
      return (marcadas.has(`${f},${c}`) ? letra : '·').padStart(3);
    });
    console.log(String(f + 1).padStart(4) + ' ' + celdas.join(''));
  });
}

// La matriz solo tiene letras mayúsculas sin tilde: se pasa a mayúsculas y se
// quitan las tildes (la Ñ se conserva).
function normalizarPalabra(texto) {
  return texto
    .trim()
    .toUpperCase()
    .replace(/Ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'Ñ');
}

// Busca una palabra nueva y muestra dónde está, marcada sola en la matriz.
function buscarNueva(texto) {
  const palabra = normalizarPalabra(texto);
  const maxLargo = Math.max(MATRIZ.length, MATRIZ[0].length);
  if (!/^[A-ZÑ]+$/.test(palabra)) {
    console.log(`  "${texto.trim()}" no es válida: usá solo letras, sin espacios.`);
    return;
  }
  if (palabra.length < 2 || palabra.length > maxLargo) {
    console.log(`  La palabra debe tener entre 2 y ${maxLargo} letras (la matriz es de ${MATRIZ.length} × ${MATRIZ[0].length}).`);
    return;
  }

  const { apariciones, comparaciones, alineaciones } = buscarPalabra(MATRIZ, palabra);
  console.log(`\n${palabra}`);
  if (apariciones.length === 0) {
    console.log('  No se encontró en ninguna de las 8 direcciones.');
  }
  const marcadas = new Set();
  apariciones.forEach((a, n) => {
    a.celdas.forEach(([f, c]) => marcadas.add(`${f},${c}`));
    const fin = a.celdas[a.celdas.length - 1];
    console.log(`  ${apariciones.length > 1 ? `${n + 1}) ` : ''}Inicio ${pos([a.fila, a.col])} → fin ${pos(fin)}   dirección: ${a.direccion}`);
    console.log(`     Celdas: ${a.celdas.map((p, i) => `${palabra[i]}${pos(p)}`).join(' ')}`);
  });
  console.log(`  Apariciones: ${apariciones.length}   alineaciones probadas: ${fmtN(alineaciones)}   comparaciones: ${fmtN(comparaciones)}`);
  if (apariciones.length > 0) {
    console.log('  (solo las filas donde aparece)');
    imprimirMatriz(MATRIZ, marcadas, true);
  }
}

async function buscarPalabrasNuevas(rl) {
  titulo('BUSCAR UNA PALABRA NUEVA (mismo algoritmo)');

  // Palabras pasadas por línea de comandos: node sopa.js DFS RED
  const deArgumentos = require.main === module ? process.argv.slice(2) : [];
  if (deArgumentos.length > 0) {
    deArgumentos.forEach(buscarNueva);
    return;
  }

  // Sin terminal interactiva (por ejemplo, salida redirigida a un archivo) no se pregunta.
  if (!rl) {
    console.log('  Para buscar otra palabra: ejecutá desde el menú, o node ejercicio3/sopa.js DFS RED');
    return;
  }

  console.log('  Escribí una palabra para buscarla en la matriz (Enter vacío para terminar).');
  console.log('  Se ignoran mayúsculas y tildes. Ejemplos: DFS, RED, SOL.');
  while (true) {
    const texto = await rl.question('\nPalabra a buscar: ');
    if (texto.trim() === '') break;
    buscarNueva(texto);
  }
}

async function main({ rl } = {}) {
  titulo('ALGORITMO: Brute Force String Match en 8 direcciones (U3)');
  console.log('Para cada palabra, cada celda (f, c) y cada dirección (df, dc):');
  console.log('  comparar matriz[f + df·k][c + dc·k] con palabra[k], k = 0..m-1');
  console.log('  y cortar en la primera letra distinta.');
  console.log('Direcciones: ' + DIRECCIONES.map((d) => d.nombre).join(', '));
  console.log('Complejidad: O(R · C · 8 · m) por palabra.');

  titulo(`MATRIZ (${MATRIZ.length} × ${MATRIZ[0].length})`);
  imprimirMatriz(MATRIZ);

  titulo('RESULTADOS');
  const marcadas = new Set();
  let totalComparaciones = 0;
  const resumen = [];

  for (const palabra of PALABRAS) {
    const { apariciones, comparaciones, alineaciones } = buscarPalabra(MATRIZ, palabra);
    totalComparaciones += comparaciones;
    console.log(`\n${palabra}`);
    if (apariciones.length === 0) {
      console.log('  No se encontró.');
    }
    for (const a of apariciones) {
      a.celdas.forEach(([f, c]) => marcadas.add(`${f},${c}`));
      const fin = a.celdas[a.celdas.length - 1];
      console.log(`  Inicio ${pos([a.fila, a.col])} → fin ${pos(fin)}   dirección: ${a.direccion}`);
      console.log(`  Celdas: ${a.celdas.map((p, i) => `${palabra[i]}${pos(p)}`).join(' ')}`);
    }
    console.log(`  Alineaciones probadas: ${alineaciones}   comparaciones de caracteres: ${comparaciones}`);
    resumen.push({ palabra, n: apariciones.length, a: apariciones[0] });
  }

  titulo('UBICACIÓN DE LAS PALABRAS EN LA MATRIZ');
  imprimirMatriz(MATRIZ, marcadas);

  titulo('RESUMEN');
  for (const r of resumen) {
    const donde = r.a ? `${pos([r.a.fila, r.a.col])} ${r.a.direccion}` : 'no encontrada';
    console.log(`  ${r.n ? '✔' : '✘'} ${r.palabra.padEnd(6)} ${donde}${r.n > 1 ? `  (+${r.n - 1} más)` : ''}`);
  }
  console.log(`\nEncontradas: ${resumen.filter((r) => r.n).length} de ${PALABRAS.length}`);
  console.log(`Comparaciones de caracteres en total: ${totalComparaciones}`);

  // ---------- Adición: palabras nuevas ----------
  let rlPropia = null;
  if (!rl && require.main === module && process.stdin.isTTY && process.argv.length <= 2) {
    rlPropia = require('readline/promises').createInterface({ input: process.stdin, output: process.stdout });
  }
  try {
    await buscarPalabrasNuevas(rl || rlPropia);
  } finally {
    if (rlPropia) rlPropia.close();
  }
}

const fmtN = (x) => x.toLocaleString('es-AR');

module.exports = { main, normalizarPalabra };

// Permite ejecutarlo solo: node ejercicio3/sopa.js  [palabras extra...]
if (require.main === module) main();
