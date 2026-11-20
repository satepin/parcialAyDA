// =====================================================================
// PARTE A — Sub-arreglo de suma máxima (el mejor período contiguo)
// =====================================================================
//
// Tres algoritmos de la teoría, cada uno con un contador de comparaciones:
//
//   - Kadane              Θ(n)        Programación Dinámica (U7)
//   - Divide y Conquista  Θ(n log n)  (U5)
//   - Fuerza bruta        Θ(n²)       (U3) — solo sobre una muestra, como referencia
//
// Todos devuelven { suma, inicio, fin }, con los índices inclusivos.

// ---------------------------------------------------------------------
// Kadane — Programación Dinámica, Θ(n)
// ---------------------------------------------------------------------
// Estado de la PD: sumaActual = mejor suma de un período que TERMINA en el día i.
//
//     mejorQueTerminaEn(i) = max( P[i],  mejorQueTerminaEn(i − 1) + P[i] )
//
// Si lo acumulado hasta ayer es ≤ 0, arrastrarlo no suma: conviene empezar un
// período nuevo hoy. Se puede aplicar a un tramo [desde, hasta] del arreglo
// (la parte B lo usa así).
function kadane(P, desde = 0, hasta = P.length - 1, contador = { comparaciones: 0 }) {
  let mejor = { suma: -Infinity, inicio: desde, fin: desde };
  let sumaActual = 0;
  let inicioActual = desde;

  for (let dia = desde; dia <= hasta; dia++) {
    contador.comparaciones++;
    if (sumaActual <= 0) {
      sumaActual = P[dia]; // empezar un período nuevo hoy
      inicioActual = dia;
    } else {
      sumaActual += P[dia]; // extender el período actual
    }

    contador.comparaciones++;
    if (sumaActual > mejor.suma) {
      mejor = { suma: sumaActual, inicio: inicioActual, fin: dia };
    }
  }

  return mejor;
}

// ---------------------------------------------------------------------
// Divide y Conquista — Θ(n log n)
// ---------------------------------------------------------------------
// El mejor período de [inicio, fin] está en uno de tres lugares:
//   1. entero en la mitad izquierda,
//   2. entero en la mitad derecha,
//   3. CRUZANDO el punto medio.
// Los dos primeros se resuelven con recursión; el que cruza se calcula en Θ(n).
//
// Recurrencia: T(n) = 2·T(n/2) + Θ(n)  →  Teorema Maestro, caso 2  →  Θ(n log n)
function divideYConquista(P, contador = { comparaciones: 0, llamadas: 0 }) {
  function mejorPeriodo(inicio, fin) {
    contador.llamadas++;
    if (inicio === fin) {
      return { suma: P[inicio], inicio, fin };
    }

    const medio = Math.floor((inicio + fin) / 2);
    const izquierda = mejorPeriodo(inicio, medio);
    const derecha = mejorPeriodo(medio + 1, fin);
    const cruzando = mejorQueCruzaElMedio(P, inicio, medio, fin, contador);

    // Combinar: el mayor de los tres (ante un empate gana el de la izquierda)
    contador.comparaciones += 2;
    let mejor = izquierda;
    if (derecha.suma > mejor.suma) mejor = derecha;
    if (cruzando.suma > mejor.suma) mejor = cruzando;
    return mejor;
  }

  return mejorPeriodo(0, P.length - 1);
}

// El mejor período que incluye P[medio] y P[medio + 1]:
// el mejor sufijo de la mitad izquierda + el mejor prefijo de la mitad derecha.
function mejorQueCruzaElMedio(P, inicio, medio, fin, contador) {
  // Hacia la izquierda, desde el medio
  let suma = 0;
  let mejorIzquierda = -Infinity;
  let desde = medio;
  for (let i = medio; i >= inicio; i--) {
    suma += P[i];
    contador.comparaciones++;
    if (suma > mejorIzquierda) {
      mejorIzquierda = suma;
      desde = i;
    }
  }

  // Hacia la derecha, desde medio + 1
  suma = 0;
  let mejorDerecha = -Infinity;
  let hasta = medio + 1;
  for (let j = medio + 1; j <= fin; j++) {
    suma += P[j];
    contador.comparaciones++;
    if (suma > mejorDerecha) {
      mejorDerecha = suma;
      hasta = j;
    }
  }

  return { suma: mejorIzquierda + mejorDerecha, inicio: desde, fin: hasta };
}

// ---------------------------------------------------------------------
// Fuerza bruta — Θ(n²)
// ---------------------------------------------------------------------
// Prueba todos los pares (inicio, fin). La suma se va acumulando al extender
// el fin, así no se recalcula: n·(n + 1)/2 sumas en total.
function fuerzaBruta(P, contador = { comparaciones: 0 }) {
  let mejor = { suma: -Infinity, inicio: 0, fin: 0 };

  for (let inicio = 0; inicio < P.length; inicio++) {
    let suma = 0;
    for (let fin = inicio; fin < P.length; fin++) {
      suma += P[fin];
      contador.comparaciones++;
      if (suma > mejor.suma) {
        mejor = { suma, inicio, fin };
      }
    }
  }

  return mejor;
}

// Suma directa de P[desde..hasta], para verificar los resultados.
function sumaDelRango(P, desde, hasta) {
  let suma = 0;
  for (let i = desde; i <= hasta; i++) {
    suma += P[i];
  }
  return suma;
}

module.exports = { kadane, divideYConquista, fuerzaBruta, sumaDelRango };
