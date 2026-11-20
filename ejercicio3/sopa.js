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

const { MATRIZ, PALABRAS } = require('./matriz');
const { DIRECCIONES, buscarPalabra } = require('./fuerzaBruta');

const titulo = (t) => console.log('\n' + '='.repeat(64) + '\n' + t + '\n' + '='.repeat(64));
const pos = ([f, c]) => `(${f + 1},${c + 1})`;

function imprimirMatriz(matriz, marcadas) {
  const C = matriz[0].length;
  console.log('     ' + Array.from({ length: C }, (_, c) => String(c + 1).padStart(3)).join(''));
  matriz.forEach((fila, f) => {
    const celdas = fila.map((letra, c) => {
      if (!marcadas) return letra.padStart(3);
      return (marcadas.has(`${f},${c}`) ? letra : '·').padStart(3);
    });
    console.log(String(f + 1).padStart(4) + ' ' + celdas.join(''));
  });
}

function main() {
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
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio3/sopa.js
if (require.main === module) main();
