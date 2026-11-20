// Ejercicio 1 — Corrector ortográfico
// Uso: node corrector.js   (o desde el menú: node index.js)
//
// Algoritmos de la teoría que se usan:
//  - Árbol AVL (U6, Transforma y Conquista):   ¿la palabra existe en el diccionario?
//  - Levenshtein con PD por tabulación (U7):   matriz completa + camino óptimo
//  - Búsqueda exhaustiva (U3, Fuerza Bruta):   comparar contra todas las palabras
//  - BK-Tree (U7, "investigar"):               misma búsqueda, podando ramas
//  - Counting Sort estable (U3 / TP3):         ordenar sugerencias por distancia

const { construirMatriz, reconstruirCamino } = require('./levenshtein');
const { AVL } = require('./avl');
const { BKTree } = require('./bktree');
const { countingSort } = require('./ordenamiento');

const PALABRA = 'programaceón';
const DICCIONARIO = [
  'programación',
  'programador',
  'programaciónes',
  'programaciónal',
  'programación web',
  'probabilístico',
];
const UMBRAL = 3;

const titulo = (t) => console.log('\n' + '='.repeat(70) + '\n' + t + '\n' + '='.repeat(70));

// Matriz con el formato de la teoría: "" en la primera fila/columna,
// filas = palabra original, columnas = palabra del diccionario.
function imprimirMatriz(D, a, b, camino) {
  const enCamino = new Set(camino.map(([i, j]) => `${i},${j}`));
  const w = 4;
  const celda = (v) => String(v).padStart(w);
  const valor = (i, j) => (enCamino.has(`${i},${j}`) ? `[${D[i][j]}]` : `${D[i][j]}`);

  console.log(celda('') + celda('""') + b.map(celda).join(''));
  for (let i = 0; i < D.length; i++) {
    const etiqueta = i === 0 ? '""' : a[i - 1];
    console.log(celda(etiqueta) + D[i].map((_, j) => celda(valor(i, j))).join(''));
  }
  console.log('  [x] = celdas del camino óptimo   ↑ borrar   ← insertar   ↖ sustituir/igual');
}

function imprimirOperaciones(ops) {
  let paso = 0;
  for (const op of ops) {
    if (op.tipo === 'coincidencia') continue;
    paso++;
    console.log(`  ${paso}. ${op.flecha} ${op.tipo.toUpperCase()}: ${op.desc}  (+${op.costo})`);
  }
  if (paso === 0) console.log('  (sin operaciones: las palabras son iguales)');
  console.log(`  Coincidencias (↖ costo 0): ${ops.filter((o) => o.tipo === 'coincidencia').length}`);
}

function main() {
  console.log(`Palabra a corregir: "${PALABRA}"   Umbral: distancia ≤ ${UMBRAL}`);

  // ---------- Paso 1: ¿existe? (AVL) ----------
  titulo('PASO 1 — Diccionario en un Árbol AVL (Transforma y Conquista)');
  const avl = new AVL();
  DICCIONARIO.forEach((p) => avl.insertar(p));
  console.log(`Nodos: ${avl.cantidad}   Altura: ${avl.altura}`);
  console.log('Árbol (raíz a la izquierda):');
  avl.dibujar().forEach((l) => console.log('  ' + l));
  console.log('InOrden: ' + avl.inorden().join(', '));

  const busqueda = avl.buscar(PALABRA);
  console.log(`\nBuscar "${PALABRA}": ${busqueda.recorrido.join(' → ')} → ${busqueda.encontrada ? 'ENCONTRADA' : 'null'}`);
  console.log(`Comparaciones: ${busqueda.comparaciones} (O(log n))`);
  if (busqueda.encontrada) {
    console.log(`\n"${PALABRA}" está en el diccionario: palabra reconocida.`);
    return;
  }
  console.log('No existe en el diccionario → se buscan palabras parecidas.');

  // ---------- Paso 2: Levenshtein contra todas las palabras ----------
  titulo('PASO 2 — Levenshtein (PD) contra cada palabra (búsqueda exhaustiva)');
  const resultados = DICCIONARIO.map((palabra) => {
    const { D, a, b } = construirMatriz(PALABRA, palabra);
    const { ops, camino } = reconstruirCamino(D, a, b);
    return { palabra, distancia: D[a.length][b.length], D, a, b, ops, camino };
  });

  for (const r of resultados) {
    console.log('\n' + '-'.repeat(70));
    console.log(`"${PALABRA}" → "${r.palabra}"   distancia = ${r.distancia}   (matriz ${r.D.length}×${r.D[0].length})`);
    console.log('-'.repeat(70));
    imprimirMatriz(r.D, r.a, r.b, r.camino);
    console.log('\nCamino óptimo (reconstruido desde la última celda hasta (0,0)):');
    console.log('  ' + [...r.camino].reverse().map(([i, j]) => `(${i},${j})`).join(' → '));
    console.log('Operaciones, en el orden en que se aplican:');
    imprimirOperaciones(r.ops);
  }

  titulo('Resumen de distancias');
  for (const r of resultados) {
    console.log(`  ${r.distancia <= UMBRAL ? '✔' : '✘'} ${r.palabra.padEnd(18)} ${r.distancia}`);
  }

  // ---------- Paso 3: misma búsqueda con BK-Tree ----------
  titulo('PASO 3 — Búsqueda con BK-Tree (poda por desigualdad triangular)');
  const bk = new BKTree();
  DICCIONARIO.forEach((p) => bk.insertar(p));
  bk.dibujar().forEach((l) => console.log('  ' + l));
  const { resultados: resBK, visitados } = bk.buscar(PALABRA, UMBRAL);
  console.log(`\nNodos visitados: ${visitados.length} de ${DICCIONARIO.length} (${visitados.join(', ')})`);
  console.log('Encontradas: ' + resBK.map((r) => `${r.palabra} (${r.distancia})`).join(', '));
  console.log('Coincide con la búsqueda exhaustiva: ' +
    (resBK.length === resultados.filter((r) => r.distancia <= UMBRAL).length ? 'sí' : 'NO'));

  // ---------- Paso 4: seleccionar y ordenar (Counting Sort) ----------
  titulo('PASO 4 — Selección (≤ 3) y orden por distancia con Counting Sort');
  const seleccionadas = resultados.filter((r) => r.distancia <= UMBRAL);
  const ordenadas = countingSort(seleccionadas, (r) => r.distancia);

  console.log('\n¿Quisiste decir?\n');
  if (ordenadas.length === 0) console.log('  No se encontraron sugerencias.');
  ordenadas.forEach((r, k) => console.log(`${k + 1}. ${r.palabra} (distancia = ${r.distancia})`));
}

module.exports = { main };

// Permite seguir ejecutándolo solo: node ejercicio1/corrector.js
if (require.main === module) main();
