// Algoritmo de Floyd-Warshall — Programación Dinámica (Unidad 7)
//
// Camino mínimo entre TODOS los pares de vértices de un grafo dirigido y
// ponderado. Admite pesos negativos, siempre que no haya ciclos negativos.
//
// Idea (según la teoría): en la iteración k se pregunta, para cada par (i, j),
// si "pasar por k" mejora el camino actual:
//     D[i][j] = min( D[i][j], D[i][k] + D[k][j] )
//
// Matriz de reconstrucción (predecesores):
//     P[i][j] = vértice anterior a j en el camino mínimo de i a j.
// Para reconstruir el camino se recorre hacia atrás desde el destino:
//     j, P[i][j], P[i][P[i][j]], ... hasta llegar a i.
//
// Ciclo negativo: si al terminar algún D[i][i] < 0, existe un ciclo de peso
// negativo que pasa por i (las distancias dejan de estar bien definidas).
//
// Complejidad: tiempo Θ(n³) (tres ciclos anidados), espacio Θ(n²).

const INF = Infinity;

function matrizInicial(vertices, arcos) {
  const n = vertices.length;
  const idx = new Map(vertices.map((v, i) => [v, i]));
  const D = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
  const P = Array.from({ length: n }, () => new Array(n).fill(null));

  for (const [u, v, w] of arcos) {
    const i = idx.get(u);
    const j = idx.get(v);
    if (w < D[i][j]) {
      D[i][j] = w;
      P[i][j] = i; // el predecesor de j en el arco directo es i
    }
  }
  return { D, P, idx };
}

// Devuelve D⁰, la matriz final, P final y el registro de cambios de cada k.
function floydWarshall(vertices, arcos) {
  const n = vertices.length;
  const { D, P, idx } = matrizInicial(vertices, arcos);
  const D0 = D.map((fila) => [...fila]);
  const iteraciones = [];

  for (let k = 0; k < n; k++) {
    const cambios = [];
    for (let i = 0; i < n; i++) {
      if (D[i][k] === INF) continue;
      for (let j = 0; j < n; j++) {
        if (D[k][j] === INF) continue;
        const porK = D[i][k] + D[k][j];
        if (porK < D[i][j]) {
          cambios.push({ i, j, antes: D[i][j], dik: D[i][k], dkj: D[k][j], despues: porK });
          D[i][j] = porK;
          P[i][j] = P[k][j]; // el predecesor de j pasa a ser el del tramo k → j
        }
      }
    }
    iteraciones.push({ k, cambios });
  }

  const ciclosNegativos = vertices.filter((_, i) => D[i][i] < 0);
  return { D0, D, P, idx, iteraciones, ciclosNegativos };
}

// Reconstruye el camino de origen a destino usando la matriz de predecesores.
function reconstruirCamino(P, idx, vertices, origen, destino) {
  const i = idx.get(origen);
  let j = idx.get(destino);
  if (i === j) return [origen];
  if (P[i][j] === null) return null; // no hay camino
  const camino = [vertices[j]];
  const pasos = [];
  while (j !== i) {
    pasos.push(`P[${origen}][${vertices[j]}] = ${vertices[P[i][j]]}`);
    j = P[i][j];
    camino.unshift(vertices[j]);
    if (camino.length > vertices.length + 1) return null; // protección ante ciclos negativos
  }
  return { camino, pasos };
}

module.exports = { INF, floydWarshall, reconstruirCamino };
