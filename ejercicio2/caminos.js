// =====================================================================
// Ejercicio 2 — Caminos mínimos con Floyd-Warshall
// =====================================================================
// Uso: node caminos.js   (o desde el menú: node index.js)
//
// Algoritmo de la teoría: Floyd-Warshall (U7, Programación Dinámica), con la
// matriz de predecesores para reconstruir los caminos y la verificación de
// ciclos negativos.
//
// Se pide:
//   1–3. distancia y camino mínimo de M a J, de O a P y de C a K
//   4.   la matriz final de distancias
//   5.   la matriz de reconstrucción de caminos
//   6.   verificar si existe algún ciclo negativo

const { VERTICES, DIRIGIDAS, BIDIRECCIONALES, ARCOS } = require('./grafo');
const { SIN_CAMINO, floydWarshall, reconstruirCamino } = require('./floyd');

const CONSULTAS = [
  ['M', 'J'],
  ['O', 'P'],
  ['C', 'K'],
];

const ANCHO_LINEA = 72;

// ---------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------

function main() {
  mostrarGrafo();

  const resultado = floydWarshall(VERTICES, ARCOS);

  titulo('MATRIZ INICIAL D⁰ (matriz de adyacencia ponderada)');
  imprimirMatriz(resultado.distanciaInicial, mostrarDistancia);

  mostrarIteraciones(resultado.iteraciones);

  CONSULTAS.forEach(([origen, destino], indice) => {
    mostrarConsulta(indice + 1, origen, destino, resultado);
  });

  titulo('4. Matriz final de distancias D');
  imprimirMatriz(resultado.distancia, mostrarDistancia);

  titulo('5. Matriz de reconstrucción de caminos P (predecesores)');
  console.log('P[i][j] = vértice anterior a j en el camino mínimo de i a j  (- = no hay / i = j)');
  imprimirMatriz(resultado.predecesor, mostrarVertice);

  mostrarCiclosNegativos(resultado);
}

// ---------------------------------------------------------------------
// Secciones de la salida
// ---------------------------------------------------------------------

function mostrarGrafo() {
  titulo('GRAFO — vértices y arcos (ver grafo.png)');

  const dirigidos = DIRIGIDAS.map(([origen, destino, peso]) => `${origen}→${destino} (${peso})`);
  const deIdaYVuelta = BIDIRECCIONALES.map(([a, b, peso]) => `${a}↔${b} (${peso})`);

  console.log(`Vértices (${VERTICES.length}): ${VERTICES.join(', ')}`);
  console.log('Arcos dirigidos (un solo sentido):');
  console.log('  ' + dirigidos.join('   '));
  console.log('Aristas con flecha en ambos extremos (ida y vuelta, mismo peso):');
  console.log('  ' + deIdaYVuelta.join('   '));
  console.log(`Total de arcos dirigidos: ${ARCOS.length}`);
}

// Muestra, para cada k, qué distancias mejoraron al pasar por ese vértice.
function mostrarIteraciones(iteraciones) {
  titulo('ITERACIONES — D[i][j] = min( D[i][j], D[i][k] + D[k][j] )');

  for (const { k, cambios } of iteraciones) {
    const intermedio = VERTICES[k];
    console.log(`\nk = ${k + 1} (nodo intermedio ${intermedio}): ${cambios.length} cambio(s)`);

    for (const cambio of cambios) {
      const i = VERTICES[cambio.i];
      const j = VERTICES[cambio.j];
      const calculo = `min(${mostrarDistancia(cambio.antes)}, ${cambio.hastaK} + ${cambio.desdeK}) = ${cambio.despues}`;
      console.log(`  ${i}→${j}: ${i}→${intermedio}→${j} = ${calculo}`);
    }
  }
}

function mostrarConsulta(numero, origen, destino, { distancia, distanciaInicial, predecesor, posicion }) {
  titulo(`${numero}. Distancia y camino mínimo de ${origen} a ${destino}`);

  const distanciaTotal = distancia[posicion.get(origen)][posicion.get(destino)];
  const reconstruccion = reconstruirCamino(predecesor, posicion, VERTICES, origen, destino);

  if (distanciaTotal === SIN_CAMINO || reconstruccion === null) {
    console.log(`No existe camino de ${origen} a ${destino}.`);
    return;
  }

  console.log('Reconstrucción hacia atrás con la matriz P:');
  for (const paso of reconstruccion.pasos) {
    console.log('  ' + paso);
  }

  // Cada tramo del camino con el peso de su arco directo (de D⁰)
  const { camino } = reconstruccion;
  const tramos = [];
  for (let t = 0; t < camino.length - 1; t++) {
    const desde = camino[t];
    const hasta = camino[t + 1];
    const peso = distanciaInicial[posicion.get(desde)][posicion.get(hasta)];
    tramos.push(`${desde}→${hasta} (${peso})`);
  }

  console.log(`\nCamino:    ${camino.join(' → ')}`);
  console.log(`Tramos:    ${tramos.join(' + ')}`);
  console.log(`Distancia: ${distanciaTotal}`);
}

function mostrarCiclosNegativos({ distancia, verticesEnCicloNegativo }) {
  titulo('6. Verificación de ciclos negativos (diagonal de D)');

  const diagonal = VERTICES.map((v, i) => `D[${v}][${v}]=${mostrarDistancia(distancia[i][i])}`);
  console.log('Diagonal: ' + diagonal.join('  '));

  if (verticesEnCicloNegativo.length === 0) {
    console.log('\nTodos los D[i][i] = 0 → NO existe ningún ciclo negativo.');
    console.log('Las distancias calculadas son válidas, aunque haya arcos con peso negativo.');
  } else {
    console.log(`\nD[i][i] < 0 en: ${verticesEnCicloNegativo.join(', ')} → EXISTE al menos un ciclo negativo.`);
    console.log('Las distancias que pasan por esos vértices no están bien definidas.');
  }
}

// ---------------------------------------------------------------------
// Ayudas de formato
// ---------------------------------------------------------------------

function mostrarDistancia(valor) {
  return valor === SIN_CAMINO ? '∞' : String(valor);
}

function mostrarVertice(posicion) {
  return posicion === null ? '-' : VERTICES[posicion];
}

// Imprime una matriz de n × n con los nombres de los vértices como encabezado.
function imprimirMatriz(matriz, formatear) {
  const celda = (texto) => texto.padStart(4);

  console.log(celda('') + VERTICES.map(celda).join(''));
  matriz.forEach((fila, i) => {
    const valores = fila.map((valor) => celda(formatear(valor)));
    console.log(celda(VERTICES[i]) + valores.join(''));
  });
}

function titulo(texto) {
  const linea = '='.repeat(ANCHO_LINEA);
  console.log(`\n${linea}\n${texto}\n${linea}`);
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio2/caminos.js
if (require.main === module) main();
