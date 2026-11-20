// PARTE B — Top-k períodos contiguos NO solapados
//
// CRITERIO ELEGIDO (ranking voraz): el período 1 es el mejor de todo el arreglo;
// el período t es el mejor sub-arreglo que no se solapa con los t−1 anteriores.
// Es lo que respondería un analista: "el mejor tramo, luego el mejor de lo que
// queda, y así sucesivamente".
//
// ALGORITMO — Divide y Conquista incremental + Max-Heap de segmentos:
//   1. Se calcula con Kadane el mejor período [l, r] del segmento [0, n−1] y se
//      inserta en un Max-Heap con clave = suma.
//   2. Se extrae el máximo del heap: ese es el próximo período del ranking.
//   3. Ese período DIVIDE su segmento [a, b] en dos partes disjuntas: [a, l−1] y
//      [r+1, b]. A cada una se le aplica Kadane y su mejor período entra al heap.
//   4. Se repite k veces.
//   Como cada segmento del heap es disjunto de los períodos ya elegidos, el
//   resultado nunca se solapa.
//
// COSTO:
//   - Kadane sobre los segmentos: en el peor caso cada extracción vuelve a
//     recorrer casi todo el arreglo → O(k · n); en la práctica la suma de los
//     largos se reduce porque solo se procesa el segmento que se partió.
//   - Heap: a lo sumo 2k + 1 elementos → O(k log k) en total.
//   - Memoria adicional: O(k) (el heap); los segmentos se guardan como índices.
//
// CONTRASTE: si el criterio fuera "maximizar la SUMA TOTAL de k períodos
// disjuntos", el voraz no siempre es óptimo. Para medirlo se resuelve también
// el óptimo exacto con Programación Dinámica en O(n · k).

const { kadane } = require('./subarreglo');
const { MaxHeap } = require('./heap');

function topKVoraz(P, k) {
  const cont = { comparaciones: 0, elementosProcesados: 0, kadaneLlamadas: 0 };
  const heap = new MaxHeap((x) => x.suma);

  const evaluar = (a, b) => {
    if (a > b) return;
    cont.kadaneLlamadas++;
    cont.elementosProcesados += b - a + 1;
    const r = kadane(P, a, b, cont);
    if (r.suma > 0) heap.insertar({ ...r, segIni: a, segFin: b }); // solo períodos con ganancia
  };

  evaluar(0, P.length - 1);
  const periodos = [];
  let maxHeap = heap.tamanio;
  while (periodos.length < k && heap.tamanio > 0) {
    const p = heap.extraerMax();
    periodos.push(p);
    evaluar(p.segIni, p.inicio - 1); // parte izquierda del segmento
    evaluar(p.fin + 1, p.segFin); //    parte derecha del segmento
    maxHeap = Math.max(maxHeap, heap.tamanio);
  }
  cont.comparacionesHeap = heap.comparaciones;
  cont.maxHeap = maxHeap;
  return { periodos, cont };
}

// Óptimo exacto de la SUMA TOTAL usando como máximo k períodos disjuntos (PD).
//   fin[j]  = mejor suma con j períodos, el j-ésimo terminando en i
//   mejor[j]= mejor suma con j períodos dentro de P[0..i]
//   fin[j]  = max(fin[j], mejor[j−1]) + P[i]      (extender o abrir uno nuevo en i)
//   mejor[j]= max(mejor[j], fin[j])
// j se recorre de k a 1 para que mejor[j−1] corresponda a P[0..i−1].
function sumaOptimaPD(P, k) {
  const fin = new Float64Array(k + 1).fill(-Infinity);
  const mejor = new Float64Array(k + 1).fill(0); // usar menos de k períodos está permitido
  let operaciones = 0;
  for (let i = 0; i < P.length; i++) {
    for (let j = k; j >= 1; j--) {
      fin[j] = Math.max(fin[j], mejor[j - 1]) + P[i];
      if (fin[j] > mejor[j]) mejor[j] = fin[j];
      operaciones += 2;
    }
  }
  return { suma: mejor[k], operaciones };
}

module.exports = { topKVoraz, sumaOptimaPD };
