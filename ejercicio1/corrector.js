// =====================================================================
// Ejercicio 1 — Corrector ortográfico
// =====================================================================
// Uso: node corrector.js   (o desde el menú: node index.js)
//
// Pasos y algoritmos de la teoría que usa cada uno:
//   1. ¿La palabra existe?            → Árbol AVL (U6, Transforma y Conquista)
//   2. Distancia contra cada palabra  → Levenshtein con PD (U7) + búsqueda exhaustiva (U3)
//   3. La misma búsqueda, podando     → BK-Tree (U7, "investigar")
//   4. Ordenar las sugerencias        → Counting Sort estable (U3 / TP3)
//
// Criterio de comparación: las vocales con tilde cuentan igual que sin tilde
// (ó = o). Por eso "programador" queda a distancia 3, como en el ejemplo.

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
const UMBRAL = 3; // se sugieren las palabras con distancia ≤ 3

const ANCHO_LINEA = 70;

// ---------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------

function main() {
  console.log(`Palabra a corregir: "${PALABRA}"   Umbral: distancia ≤ ${UMBRAL}`);
  console.log('Criterio: las vocales con tilde cuentan igual que sin tilde (ó = o, á = a, …); la ñ es distinta de la n.');

  const existe = paso1BuscarEnElDiccionario();
  if (existe) return;

  const resultados = paso2CalcularDistancias();
  paso3BuscarConBKTree(resultados);
  paso4MostrarSugerencias(resultados);
}

// ---------------------------------------------------------------------
// Paso 1: ¿la palabra está en el diccionario? (AVL)
// ---------------------------------------------------------------------

function paso1BuscarEnElDiccionario() {
  titulo('PASO 1 — Diccionario en un Árbol AVL (Transforma y Conquista)');

  const arbol = new AVL();
  for (const palabra of DICCIONARIO) {
    arbol.insertar(palabra);
  }

  console.log(`Nodos: ${arbol.cantidad}   Altura: ${arbol.altura}`);
  console.log('Árbol (raíz a la izquierda):');
  for (const linea of arbol.dibujar()) {
    console.log('  ' + linea);
  }
  console.log('InOrden: ' + arbol.inorden().join(', '));

  const busqueda = arbol.buscar(PALABRA);
  const final = busqueda.encontrada ? 'ENCONTRADA' : 'null';
  console.log(`\nBuscar "${PALABRA}": ${busqueda.recorrido.join(' → ')} → ${final}`);
  console.log(`Comparaciones: ${busqueda.comparaciones} (O(log n))`);

  if (busqueda.encontrada) {
    console.log(`\n"${PALABRA}" está en el diccionario: palabra reconocida.`);
  } else {
    console.log('No existe en el diccionario → se buscan palabras parecidas.');
  }
  return busqueda.encontrada;
}

// ---------------------------------------------------------------------
// Paso 2: Levenshtein contra cada palabra del diccionario
// ---------------------------------------------------------------------

function paso2CalcularDistancias() {
  titulo('PASO 2 — Levenshtein (PD) contra cada palabra (búsqueda exhaustiva)');

  const resultados = [];
  for (const palabra of DICCIONARIO) {
    const { matriz, letrasOrigen, letrasDestino } = construirMatriz(PALABRA, palabra);
    const { operaciones, camino } = reconstruirCamino(matriz, letrasOrigen, letrasDestino);
    const distancia = matriz[letrasOrigen.length][letrasDestino.length];

    resultados.push({ palabra, distancia, matriz, letrasOrigen, letrasDestino, operaciones, camino });
  }

  for (const resultado of resultados) {
    mostrarComparacion(resultado);
  }

  titulo('Resumen de distancias');
  for (const { palabra, distancia } of resultados) {
    const marca = distancia <= UMBRAL ? '✔' : '✘';
    console.log(`  ${marca} ${palabra.padEnd(18)} ${distancia}`);
  }

  return resultados;
}

function mostrarComparacion({ palabra, distancia, matriz, letrasOrigen, letrasDestino, operaciones, camino }) {
  const filas = matriz.length;
  const columnas = matriz[0].length;

  console.log('\n' + '-'.repeat(ANCHO_LINEA));
  console.log(`"${PALABRA}" → "${palabra}"   distancia = ${distancia}   (matriz ${filas}×${columnas})`);
  console.log('-'.repeat(ANCHO_LINEA));

  imprimirMatriz(matriz, letrasOrigen, letrasDestino, camino);

  const caminoDesdeElFinal = [...camino].reverse().map(([i, j]) => `(${i},${j})`);
  console.log('\nCamino óptimo (reconstruido desde la última celda hasta (0,0)):');
  console.log('  ' + caminoDesdeElFinal.join(' → '));

  console.log('Operaciones, en el orden en que se aplican:');
  imprimirOperaciones(operaciones);
}

// Matriz con el formato de la teoría: "" en la primera fila y columna,
// filas = palabra a corregir, columnas = palabra del diccionario.
// Las celdas del camino óptimo se muestran entre corchetes.
function imprimirMatriz(matriz, letrasOrigen, letrasDestino, camino) {
  const celdasDelCamino = new Set(camino.map(([i, j]) => `${i},${j}`));
  const celda = (texto) => String(texto).padStart(4);

  const encabezado = celda('') + celda('""') + letrasDestino.map(celda).join('');
  console.log(encabezado);

  for (let i = 0; i < matriz.length; i++) {
    const etiqueta = i === 0 ? '""' : letrasOrigen[i - 1];
    let fila = celda(etiqueta);
    for (let j = 0; j < matriz[i].length; j++) {
      const valor = matriz[i][j];
      fila += celda(celdasDelCamino.has(`${i},${j}`) ? `[${valor}]` : valor);
    }
    console.log(fila);
  }

  console.log('  [x] = celdas del camino óptimo   ↑ borrar   ← insertar   ↖ sustituir/igual');
}

function imprimirOperaciones(operaciones) {
  const cambios = operaciones.filter((op) => op.tipo !== 'coincidencia');
  const coincidencias = operaciones.filter((op) => op.tipo === 'coincidencia');
  const coincidenciasConTilde = coincidencias.filter((op) => op.ignoraTilde);

  cambios.forEach((op, indice) => {
    console.log(`  ${indice + 1}. ${op.flecha} ${op.tipo.toUpperCase()}: ${op.descripcion}  (+${op.costo})`);
  });
  if (cambios.length === 0) {
    console.log('  (sin operaciones: las palabras son iguales)');
  }

  let resumen = `  Coincidencias (↖ costo 0): ${coincidencias.length}`;
  if (coincidenciasConTilde.length > 0) {
    const ejemplos = coincidenciasConTilde.map((op) => op.letras).join(', ');
    resumen += `, de ellas ${coincidenciasConTilde.length} ignorando la tilde: ${ejemplos}`;
  }
  console.log(resumen);
}

// ---------------------------------------------------------------------
// Paso 3: la misma búsqueda con un BK-Tree
// ---------------------------------------------------------------------

function paso3BuscarConBKTree(resultadosExhaustivos) {
  titulo('PASO 3 — Búsqueda con BK-Tree (poda por desigualdad triangular)');

  const arbol = new BKTree();
  for (const palabra of DICCIONARIO) {
    arbol.insertar(palabra);
  }
  for (const linea of arbol.dibujar()) {
    console.log('  ' + linea);
  }

  const { encontradas, visitados } = arbol.buscar(PALABRA, UMBRAL);
  const listaEncontradas = encontradas.map(({ palabra, distancia }) => `${palabra} (${distancia})`);
  console.log(`\nNodos visitados: ${visitados.length} de ${DICCIONARIO.length} (${visitados.join(', ')})`);
  console.log('Encontradas: ' + listaEncontradas.join(', '));

  const cantidadExhaustiva = resultadosExhaustivos.filter((r) => r.distancia <= UMBRAL).length;
  const coincide = encontradas.length === cantidadExhaustiva;
  console.log('Coincide con la búsqueda exhaustiva: ' + (coincide ? 'sí' : 'NO'));
}

// ---------------------------------------------------------------------
// Paso 4: seleccionar las cercanas y ordenarlas por distancia
// ---------------------------------------------------------------------

function paso4MostrarSugerencias(resultados) {
  titulo('PASO 4 — Selección (≤ 3) y orden por distancia con Counting Sort');

  const cercanas = resultados.filter((r) => r.distancia <= UMBRAL);
  const sugerencias = countingSort(cercanas, (r) => r.distancia);

  console.log('\n¿Quisiste decir?\n');
  if (sugerencias.length === 0) {
    console.log('  No se encontraron sugerencias.');
  }
  sugerencias.forEach(({ palabra, distancia }, indice) => {
    console.log(`${indice + 1}. ${palabra} (distancia = ${distancia})`);
  });
}

// ---------------------------------------------------------------------

function titulo(texto) {
  const linea = '='.repeat(ANCHO_LINEA);
  console.log(`\n${linea}\n${texto}\n${linea}`);
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio1/corrector.js
if (require.main === module) main();
