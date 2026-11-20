// =====================================================================
// Algoritmo de Floyd-Warshall — Programación Dinámica (Unidad 7)
// =====================================================================
//
// Calcula el camino mínimo entre TODOS los pares de vértices de un grafo
// dirigido y ponderado. Admite pesos negativos, mientras no haya ciclos negativos.
//
// Idea: en la iteración k se pregunta, para cada par (i, j), si "pasar por k"
// mejora el camino que se conoce hasta ahora:
//
//     distancia[i][j] = min( distancia[i][j],  distancia[i][k] + distancia[k][j] )
//
// Matriz de reconstrucción (predecesores):
//     predecesor[i][j] = vértice anterior a j en el camino mínimo de i a j.
// Para armar el camino se va hacia atrás desde el destino hasta llegar al origen.
//
// Ciclo negativo: si al terminar algún distancia[i][i] < 0, hay un ciclo de peso
// negativo que pasa por i (las distancias dejan de estar bien definidas).
//
// Complejidad: tiempo Θ(n³) (tres ciclos anidados) y espacio Θ(n²).
//
// Los vértices se manejan por su número de posición (0, 1, 2, …) dentro de la
// lista de vértices; SIN_CAMINO (∞) indica que todavía no se conoce un camino.

const SIN_CAMINO = Infinity;

// Matriz de n × n con todas las celdas en `valorInicial`.
function crearMatriz(n, valorInicial) {
  const matriz = [];
  for (let i = 0; i < n; i++) {
    matriz.push(new Array(n).fill(valorInicial));
  }
  return matriz;
}

// D⁰: la matriz de adyacencia ponderada. 0 en la diagonal, el peso del arco
// si existe y ∞ si no hay conexión directa.
function matricesIniciales(vertices, arcos) {
  const n = vertices.length;
  const posicion = new Map(vertices.map((vertice, i) => [vertice, i]));

  const distancia = crearMatriz(n, SIN_CAMINO);
  const predecesor = crearMatriz(n, null);
  for (let i = 0; i < n; i++) {
    distancia[i][i] = 0;
  }

  for (const [origen, destino, peso] of arcos) {
    const i = posicion.get(origen);
    const j = posicion.get(destino);
    if (peso < distancia[i][j]) {
      distancia[i][j] = peso;
      predecesor[i][j] = i; // en un arco directo, el anterior a j es el propio i
    }
  }

  return { distancia, predecesor, posicion };
}

function floydWarshall(vertices, arcos) {
  const n = vertices.length;
  const { distancia, predecesor, posicion } = matricesIniciales(vertices, arcos);
  const distanciaInicial = distancia.map((fila) => [...fila]); // copia de D⁰ para mostrarla
  const iteraciones = []; // qué celdas cambió cada k, para mostrar el paso a paso

  for (let k = 0; k < n; k++) {
    const cambios = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const hastaK = distancia[i][k];
        const desdeK = distancia[k][j];
        if (hastaK === SIN_CAMINO || desdeK === SIN_CAMINO) continue;

        const pasandoPorK = hastaK + desdeK;
        if (pasandoPorK < distancia[i][j]) {
          cambios.push({ i, j, antes: distancia[i][j], hastaK, desdeK, despues: pasandoPorK });
          distancia[i][j] = pasandoPorK;
          // El último tramo ahora es el de k a j: se copia su predecesor.
          predecesor[i][j] = predecesor[k][j];
        }
      }
    }

    iteraciones.push({ k, cambios });
  }

  const verticesEnCicloNegativo = vertices.filter((_, i) => distancia[i][i] < 0);

  return { distanciaInicial, distancia, predecesor, posicion, iteraciones, verticesEnCicloNegativo };
}

// Arma el camino de `origen` a `destino` yendo hacia atrás con los predecesores.
// Devuelve null si no hay camino. `pasos` explica cada consulta a la matriz.
function reconstruirCamino(predecesor, posicion, vertices, origen, destino) {
  const i = posicion.get(origen);
  let actual = posicion.get(destino);

  if (i === actual) return { camino: [origen], pasos: [] };
  if (predecesor[i][actual] === null) return null;

  const camino = [vertices[actual]];
  const pasos = [];

  while (actual !== i) {
    const anterior = predecesor[i][actual];
    pasos.push(`P[${origen}][${vertices[actual]}] = ${vertices[anterior]}`);
    camino.unshift(vertices[anterior]);
    actual = anterior;

    // Protección: con un ciclo negativo el recorrido podría no terminar nunca.
    if (camino.length > vertices.length + 1) return null;
  }

  return { camino, pasos };
}

module.exports = { SIN_CAMINO, floydWarshall, reconstruirCamino };
