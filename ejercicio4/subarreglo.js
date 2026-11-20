// PARTE A — Subarreglo de suma máxima (mejor período contiguo)
//
// Tres algoritmos de la teoría, con contador de comparaciones:
//  - Fuerza bruta O(n²)            (U3)  — solo sobre una muestra, como referencia
//  - Divide y Conquista O(n log n) (U5)  — T(n) = 2T(n/2) + Θ(n)  → Teorema Maestro caso 2
//  - Kadane O(n)                   (U7)  — Programación Dinámica:
//        mejorTerminandoEn(i) = max( P[i], mejorTerminandoEn(i-1) + P[i] )
//
// Todos devuelven { suma, inicio, fin } con índices inclusivos.

// ---------- Kadane (Programación Dinámica, O(n)) ----------
// cur = mejor suma de un período que TERMINA en i (estado de la PD).
// Si cur ≤ 0, arrastrarlo no conviene: el período nuevo empieza en i.
function kadane(P, desde = 0, hasta = P.length - 1, cont = { comparaciones: 0 }) {
  let mejor = -Infinity, ini = desde, fin = desde;
  let cur = 0, inicioActual = desde;
  for (let i = desde; i <= hasta; i++) {
    cont.comparaciones++;
    if (cur <= 0) { cur = P[i]; inicioActual = i; } else cur += P[i];
    cont.comparaciones++;
    if (cur > mejor) { mejor = cur; ini = inicioActual; fin = i; }
  }
  return { suma: mejor, inicio: ini, fin };
}

// ---------- Divide y Conquista (O(n log n)) ----------
// El mejor período está totalmente a la izquierda, totalmente a la derecha
// o CRUZA el punto medio. El que cruza se calcula en Θ(n) (sufijo máximo de
// la mitad izquierda + prefijo máximo de la mitad derecha).
function divideYConquista(P, cont = { comparaciones: 0, llamadas: 0 }) {
  function rec(lo, hi) {
    cont.llamadas++;
    if (lo === hi) return { suma: P[lo], inicio: lo, fin: lo };
    const mid = (lo + hi) >> 1;
    const izq = rec(lo, mid);
    const der = rec(mid + 1, hi);

    // Período que cruza el medio
    let s = 0, mejorIzq = -Infinity, ini = mid;
    for (let i = mid; i >= lo; i--) {
      s += P[i];
      cont.comparaciones++;
      if (s > mejorIzq) { mejorIzq = s; ini = i; }
    }
    s = 0;
    let mejorDer = -Infinity, fin = mid + 1;
    for (let j = mid + 1; j <= hi; j++) {
      s += P[j];
      cont.comparaciones++;
      if (s > mejorDer) { mejorDer = s; fin = j; }
    }
    const cruza = { suma: mejorIzq + mejorDer, inicio: ini, fin };

    // Combinar: el mayor de los tres (ante empate se prefiere el de la izquierda)
    cont.comparaciones += 2;
    let res = izq;
    if (der.suma > res.suma) res = der;
    if (cruza.suma > res.suma) res = cruza;
    return res;
  }
  return rec(0, P.length - 1);
}

// ---------- Fuerza bruta (O(n²)) ----------
// Prueba todos los pares (i, j); la suma se acumula para no recalcular (n(n+1)/2 sumas).
function fuerzaBruta(P, cont = { comparaciones: 0 }) {
  let mejor = -Infinity, ini = 0, fin = 0;
  for (let i = 0; i < P.length; i++) {
    let s = 0;
    for (let j = i; j < P.length; j++) {
      s += P[j];
      cont.comparaciones++;
      if (s > mejor) { mejor = s; ini = i; fin = j; }
    }
  }
  return { suma: mejor, inicio: ini, fin };
}

function sumaRango(P, a, b) {
  let s = 0;
  for (let i = a; i <= b; i++) s += P[i];
  return s;
}

module.exports = { kadane, divideYConquista, fuerzaBruta, sumaRango };
