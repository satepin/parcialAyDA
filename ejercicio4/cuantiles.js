// PARTE C — Mediana y percentiles
//
//  - Quickselect con partición de LOMUTO (U4, Reducir y Conquistar de tamaño variable)
//  - Quickselect con partición de HOARE  (U4 / U5)
//  - Merge Sort como baseline (U5, Divide y Conquista): ordena todo y lee la posición
//  - Búsqueda binaria (U4) para validar los cuantiles sobre el arreglo ordenado
//
// Las dos versiones de Quickselect son iterativas e in-place → memoria adicional O(1).
// El pivote es aleatorio (con semilla, para que sea reproducible) salvo en los
// experimentos de entradas adversas, donde se usa pivote fijo a propósito.
//
// Conteo: "comparaciones" = comparaciones entre elementos del arreglo;
//         "swaps" = intercambios reales (i ≠ j).

// ---------- Particiones ----------

// Lomuto: pivote al final; i marca el límite de la zona "< pivote".
// Resultado: [ < pivote | pivote | ≥ pivote ], devuelve la posición final del pivote.
function particionLomuto(a, lo, hi, elegirPivote, c) {
  const p = elegirPivote(lo, hi, 'lomuto');
  if (p !== hi) { [a[p], a[hi]] = [a[hi], a[p]]; c.swaps++; }
  const pivote = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    c.comparaciones++;
    if (a[j] < pivote) {
      if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; c.swaps++; }
      i++;
    }
  }
  if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; c.swaps++; }
  return i;
}

// Hoare: dos índices que avanzan desde los extremos y se detienen en elementos
// del lado equivocado (incluidos los IGUALES al pivote), que se intercambian.
// Resultado: a[lo..j] ≤ pivote ≤ a[j+1..hi]; devuelve j.
function particionHoare(a, lo, hi, elegirPivote, c) {
  const p = elegirPivote(lo, hi, 'hoare');
  if (p !== lo) { [a[p], a[lo]] = [a[lo], a[p]]; c.swaps++; }
  const pivote = a[lo];
  let i = lo - 1;
  let j = hi + 1;
  while (true) {
    do { i++; c.comparaciones++; } while (a[i] < pivote);
    do { j--; c.comparaciones++; } while (a[j] > pivote);
    if (i >= j) return j;
    [a[i], a[j]] = [a[j], a[i]];
    c.swaps++;
  }
}

// ---------- Quickselect ----------
// Deja en a[k] el elemento que estaría en la posición k si el arreglo estuviera
// ordenado, con todo lo de la izquierda ≤ a[k] ≤ todo lo de la derecha.
// Cada partición descarta un lado entero: en promedio n + n/2 + n/4 + ... ≈ 2n → O(n).

function quickselectLomuto(a, k, elegirPivote, c) {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    c.particiones++;
    const p = particionLomuto(a, lo, hi, elegirPivote, c);
    if (k === p) break;
    if (k < p) hi = p - 1; else lo = p + 1;
  }
  return a[k];
}

function quickselectHoare(a, k, elegirPivote, c) {
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    c.particiones++;
    const j = particionHoare(a, lo, hi, elegirPivote, c);
    if (k <= j) hi = j; else lo = j + 1;
  }
  return a[k];
}

// ---------- Merge Sort (baseline) ----------
// Top-down con UN solo buffer auxiliar de n elementos (memoria adicional Θ(n)).
// Es estable y siempre Θ(n log n), sin importar la entrada.
function mergeSort(a, c) {
  const aux = new Int32Array(a.length);
  c.memoriaExtra = aux.byteLength;
  function rec(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    rec(lo, mid);
    rec(mid + 1, hi);
    // Si ya están en orden no hace falta mezclar
    c.comparaciones++;
    if (a[mid] <= a[mid + 1]) return;
    for (let t = lo; t <= hi; t++) aux[t] = a[t];
    c.movimientos += hi - lo + 1;
    let i = lo, j = mid + 1;
    for (let t = lo; t <= hi; t++) {
      if (i > mid) a[t] = aux[j++];
      else if (j > hi) a[t] = aux[i++];
      else {
        c.comparaciones++;
        a[t] = aux[j] < aux[i] ? aux[j++] : aux[i++];
      }
      c.movimientos++;
    }
  }
  rec(0, a.length - 1);
  return a;
}

// ---------- Búsqueda binaria (validación) ----------
// cuantosMenores(v)   = cantidad de elementos < v   (lower bound)
// cuantosMenoresOIg(v)= cantidad de elementos ≤ v   (upper bound)
// v es el k-ésimo menor (0-based) ⇔ cuantosMenores(v) ≤ k < cuantosMenoresOIg(v)
function cuantosMenores(ord, v, c = { comparaciones: 0 }) {
  let lo = 0, hi = ord.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    c.comparaciones++;
    if (ord[m] < v) lo = m + 1; else hi = m;
  }
  return lo;
}

function cuantosMenoresOIg(ord, v, c = { comparaciones: 0 }) {
  let lo = 0, hi = ord.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    c.comparaciones++;
    if (ord[m] <= v) lo = m + 1; else hi = m;
  }
  return lo;
}

// ---------- Convenciones ----------
// Percentil p (rango más cercano, "nearest-rank"): el menor valor tal que al
// menos el p % de los datos es ≤ a él → posición 0-based k = ⌈p·n/100⌉ − 1.
const indicePercentil = (p, n) => Math.ceil((p * n) / 100) - 1;

// Pivotes
const pivoteAleatorio = (rng) => (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pivoteFijo = (lo, hi, tipo) => (tipo === 'lomuto' ? hi : lo); // último (Lomuto) / primero (Hoare)

const nuevoContador = () => ({ comparaciones: 0, swaps: 0, particiones: 0, movimientos: 0, memoriaExtra: 0 });

module.exports = {
  particionLomuto, particionHoare, quickselectLomuto, quickselectHoare, mergeSort,
  cuantosMenores, cuantosMenoresOIg, indicePercentil, pivoteAleatorio, pivoteFijo, nuevoContador,
};
