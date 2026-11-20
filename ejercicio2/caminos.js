// Ejercicio 2 — Caminos mínimos con Floyd-Warshall
// Uso: node caminos.js   (o desde el menú: node index.js)
//
// Algoritmo de la teoría que se usa:
//  - Floyd-Warshall (U7, Programación Dinámica) con matriz de predecesores
//    para reconstruir los caminos y verificación de ciclos negativos.

const { VERTICES, DIRIGIDAS, BIDIRECCIONALES, ARCOS } = require('./grafo');
const { INF, floydWarshall, reconstruirCamino } = require('./floyd');

const CONSULTAS = [
  ['M', 'J'],
  ['O', 'P'],
  ['C', 'K'],
];

const titulo = (t) => console.log('\n' + '='.repeat(72) + '\n' + t + '\n' + '='.repeat(72));
const fmt = (v) => (v === INF ? '∞' : String(v));

function imprimirMatriz(M, formato) {
  const w = 4;
  console.log(' '.repeat(w) + VERTICES.map((v) => v.padStart(w)).join(''));
  M.forEach((fila, i) => console.log(VERTICES[i].padStart(w) + fila.map((x) => formato(x).padStart(w)).join('')));
}

function main() {
  // ---------- Grafo ----------
  titulo('GRAFO — vértices y arcos (ver grafo.png)');
  console.log(`Vértices (${VERTICES.length}): ${VERTICES.join(', ')}`);
  console.log('Arcos dirigidos (un solo sentido):');
  console.log('  ' + DIRIGIDAS.map(([u, v, w]) => `${u}→${v} (${w})`).join('   '));
  console.log('Aristas con flecha en ambos extremos (ida y vuelta, mismo peso):');
  console.log('  ' + BIDIRECCIONALES.map(([u, v, w]) => `${u}↔${v} (${w})`).join('   '));
  console.log(`Total de arcos dirigidos: ${ARCOS.length}`);

  const { D0, D, P, idx, iteraciones, ciclosNegativos } = floydWarshall(VERTICES, ARCOS);

  titulo('MATRIZ INICIAL D⁰ (matriz de adyacencia ponderada)');
  imprimirMatriz(D0, fmt);

  // ---------- Iteraciones ----------
  titulo('ITERACIONES — D[i][j] = min( D[i][j], D[i][k] + D[k][j] )');
  for (const { k, cambios } of iteraciones) {
    console.log(`\nk = ${k + 1} (nodo intermedio ${VERTICES[k]}): ${cambios.length} cambio(s)`);
    for (const c of cambios) {
      const i = VERTICES[c.i];
      const j = VERTICES[c.j];
      console.log(`  ${i}→${j}: ${i}→${VERTICES[k]}→${j} = min(${fmt(c.antes)}, ${c.dik} + ${c.dkj}) = ${c.despues}`);
    }
  }

  // ---------- Consultas 1, 2 y 3 ----------
  CONSULTAS.forEach(([o, d], n) => {
    titulo(`${n + 1}. Distancia y camino mínimo de ${o} a ${d}`);
    const dist = D[idx.get(o)][idx.get(d)];
    const r = reconstruirCamino(P, idx, VERTICES, o, d);
    if (dist === INF || !r) {
      console.log(`No existe camino de ${o} a ${d}.`);
      return;
    }
    console.log('Reconstrucción hacia atrás con la matriz P:');
    r.pasos.forEach((p) => console.log('  ' + p));
    const tramos = [];
    for (let t = 0; t < r.camino.length - 1; t++) {
      const a = r.camino[t];
      const b = r.camino[t + 1];
      tramos.push(`${a}→${b} (${D0[idx.get(a)][idx.get(b)]})`);
    }
    console.log(`\nCamino:    ${r.camino.join(' → ')}`);
    console.log(`Tramos:    ${tramos.join(' + ')}`);
    console.log(`Distancia: ${dist}`);
  });

  // ---------- Matrices finales ----------
  titulo('4. Matriz final de distancias D');
  imprimirMatriz(D, fmt);

  titulo('5. Matriz de reconstrucción de caminos P (predecesores)');
  console.log('P[i][j] = vértice anterior a j en el camino mínimo de i a j  (- = no hay / i = j)');
  imprimirMatriz(P, (x) => (x === null ? '-' : VERTICES[x]));

  // ---------- Ciclos negativos ----------
  titulo('6. Verificación de ciclos negativos (diagonal de D)');
  console.log('Diagonal: ' + VERTICES.map((v, i) => `D[${v}][${v}]=${fmt(D[i][i])}`).join('  '));
  if (ciclosNegativos.length === 0) {
    console.log('\nTodos los D[i][i] = 0 → NO existe ningún ciclo negativo.');
    console.log('Las distancias calculadas son válidas, aunque haya arcos con peso negativo.');
  } else {
    console.log(`\nD[i][i] < 0 en: ${ciclosNegativos.join(', ')} → EXISTE al menos un ciclo negativo.`);
    console.log('Las distancias que pasan por esos vértices no están bien definidas.');
  }
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio2/caminos.js
if (require.main === module) main();
