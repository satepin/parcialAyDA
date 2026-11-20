// Counting Sort (no comparativo) — Unidad 3 / TP3
//
// Las distancias son enteros chicos (0..umbral), así que conviene contar en
// lugar de comparar: O(n + k), con k = distancia máxima.
// Esta versión es ESTABLE (recorre la entrada de atrás hacia adelante), por lo
// que ante un empate se respeta el orden original del diccionario.

function countingSort(elementos, clave) {
  if (elementos.length === 0) return [];
  const k = Math.max(...elementos.map(clave));
  const conteo = new Array(k + 1).fill(0);

  // 1. Contar cuántas veces aparece cada distancia
  for (const e of elementos) conteo[clave(e)]++;
  // 2. Acumular: conteo[d] = posición final (exclusiva) de la distancia d
  for (let d = 1; d <= k; d++) conteo[d] += conteo[d - 1];
  // 3. Ubicar cada elemento en su lugar (de atrás hacia adelante → estable)
  const salida = new Array(elementos.length);
  for (let i = elementos.length - 1; i >= 0; i--) {
    const d = clave(elementos[i]);
    salida[--conteo[d]] = elementos[i];
  }
  return salida;
}

module.exports = { countingSort };
