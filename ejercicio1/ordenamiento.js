// =====================================================================
// Counting Sort (ordenamiento por conteo, no comparativo) — Unidad 3 / TP3
// =====================================================================
//
// Las distancias son enteros chicos (de 0 al umbral), así que conviene contar
// cuántas hay de cada una en lugar de comparar elementos: O(n + k), con
// k = distancia máxima.
//
// Esta versión es ESTABLE: ante un empate se respeta el orden de entrada
// (el orden del diccionario).
//
// obtenerClave(elemento) devuelve el número por el que se ordena.

function countingSort(elementos, obtenerClave) {
  if (elementos.length === 0) return [];

  const claveMaxima = Math.max(...elementos.map(obtenerClave));
  const conteo = new Array(claveMaxima + 1).fill(0);

  // 1. Contar cuántos elementos hay con cada clave
  for (const elemento of elementos) {
    conteo[obtenerClave(elemento)]++;
  }

  // 2. Acumular: ahora conteo[c] = cuántos elementos tienen clave ≤ c,
  //    es decir, la posición donde TERMINA el bloque de la clave c.
  for (let clave = 1; clave <= claveMaxima; clave++) {
    conteo[clave] += conteo[clave - 1];
  }

  // 3. Ubicar cada elemento al final de su bloque. Se recorre de atrás hacia
  //    adelante para que los empates conserven su orden (estabilidad).
  const ordenados = new Array(elementos.length);
  for (let i = elementos.length - 1; i >= 0; i--) {
    const clave = obtenerClave(elementos[i]);
    conteo[clave]--;
    ordenados[conteo[clave]] = elementos[i];
  }

  return ordenados;
}

module.exports = { countingSort };
