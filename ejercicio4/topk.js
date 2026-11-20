// =====================================================================
// PARTE B — Los k mejores períodos que no se solapan
// =====================================================================
//
// CRITERIO ELEGIDO (ranking voraz): el período 1 es el mejor de todo el arreglo
// y el período t es el mejor sub-arreglo que no se solapa con los t − 1 ya
// elegidos. Es lo que contestaría un analista: "el mejor tramo, después el
// mejor de lo que queda, y así".
//
// ALGORITMO — Divide y Conquista incremental + Max-Heap de segmentos:
//   1. Se busca con Kadane el mejor período del segmento [0, n − 1] y se guarda
//      en un Max-Heap ordenado por su suma.
//   2. Se extrae el máximo del heap: ese es el próximo período del ranking.
//   3. Ese período PARTE su segmento [a, b] en dos pedazos que no lo tocan:
//      [a, inicio − 1] y [fin + 1, b]. Se busca con Kadane el mejor período de
//      cada pedazo y se guardan en el heap.
//   4. Se repite hasta tener k períodos.
//   Como cada segmento del heap es disjunto de los períodos ya elegidos, el
//   resultado nunca se solapa.
//
// COSTO:
//   - Kadane: en el peor caso cada extracción recorre casi todo el arreglo
//     → O(k · n). En la práctica solo recorre el segmento que se partió.
//   - Heap: como mucho 2k + 1 elementos → O(k log k) en total, y memoria O(k).
//
// CONTRASTE: si el criterio fuera "la mayor SUMA TOTAL de k períodos
// disjuntos", el voraz no siempre es óptimo. Para medir la diferencia se
// calcula también el óptimo exacto con Programación Dinámica en O(n · k).

const { kadane } = require('./subarreglo');
const { MaxHeap } = require('./heap');

function topKVoraz(P, k) {
  const estadisticas = { comparaciones: 0, elementosProcesados: 0, kadaneLlamadas: 0 };
  const heap = new MaxHeap((periodo) => periodo.suma);

  // Busca el mejor período dentro del segmento [desde, hasta] y lo guarda en
  // el heap (solo si deja ganancia).
  function agregarMejorPeriodoDe(desde, hasta) {
    if (desde > hasta) return; // segmento vacío

    estadisticas.kadaneLlamadas++;
    estadisticas.elementosProcesados += hasta - desde + 1;
    const periodo = kadane(P, desde, hasta, estadisticas);

    if (periodo.suma > 0) {
      heap.insertar({ ...periodo, segmentoInicio: desde, segmentoFin: hasta });
    }
  }

  agregarMejorPeriodoDe(0, P.length - 1);

  const periodos = [];
  let tamanioMaximoDelHeap = heap.tamanio;

  while (periodos.length < k && heap.tamanio > 0) {
    const elegido = heap.extraerMax();
    periodos.push(elegido);

    // El período elegido parte su segmento en dos: lo de antes y lo de después.
    agregarMejorPeriodoDe(elegido.segmentoInicio, elegido.inicio - 1);
    agregarMejorPeriodoDe(elegido.fin + 1, elegido.segmentoFin);

    tamanioMaximoDelHeap = Math.max(tamanioMaximoDelHeap, heap.tamanio);
  }

  estadisticas.comparacionesHeap = heap.comparaciones;
  estadisticas.tamanioMaximoDelHeap = tamanioMaximoDelHeap;
  return { periodos, estadisticas };
}

// Óptimo exacto de la SUMA TOTAL usando como mucho k períodos disjuntos (PD).
//
//   terminaHoy[j] = mejor suma con j períodos, donde el j-ésimo termina en el día i
//   mejorHasta[j] = mejor suma con j períodos dentro de P[0..i]
//
//   terminaHoy[j] = max( terminaHoy[j],  mejorHasta[j − 1] ) + P[i]
//                        └ extender el     └ abrir un período
//                          período j         nuevo hoy
//   mejorHasta[j] = max( mejorHasta[j], terminaHoy[j] )
//
// j se recorre de k a 1 para que mejorHasta[j − 1] todavía sea el del día anterior.
function sumaOptimaPD(P, k) {
  const terminaHoy = new Float64Array(k + 1).fill(-Infinity);
  const mejorHasta = new Float64Array(k + 1).fill(0); // usar menos de k períodos está permitido
  let operaciones = 0;

  for (let dia = 0; dia < P.length; dia++) {
    for (let j = k; j >= 1; j--) {
      terminaHoy[j] = Math.max(terminaHoy[j], mejorHasta[j - 1]) + P[dia];
      if (terminaHoy[j] > mejorHasta[j]) {
        mejorHasta[j] = terminaHoy[j];
      }
      operaciones += 2;
    }
  }

  return { suma: mejorHasta[k], operaciones };
}

module.exports = { topKVoraz, sumaOptimaPD };
