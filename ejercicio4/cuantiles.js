// =====================================================================
// PARTE C — Mediana y percentiles
// =====================================================================
//
//   - Quickselect con partición de LOMUTO  (U4, Reducir y Conquistar de tamaño variable)
//   - Quickselect con partición de HOARE   (U4 / U5)
//   - Merge Sort como referencia           (U5, Divide y Conquista): ordena todo
//   - Búsqueda binaria                     (U4) para validar sobre el arreglo ordenado
//
// Las dos versiones de Quickselect son iterativas y trabajan sobre el mismo
// arreglo (in-place) → memoria adicional O(1).
//
// El pivote es aleatorio (con semilla, para que sea reproducible), salvo en los
// experimentos de entradas adversas, donde se usa un pivote fijo a propósito.
//
// Qué se cuenta:
//   comparaciones = comparaciones entre elementos del arreglo
//   swaps         = intercambios reales (de dos posiciones distintas)

// Cuenta de operaciones de cada corrida.
function nuevoContador() {
  return { comparaciones: 0, swaps: 0, particiones: 0, movimientos: 0, memoriaExtra: 0 };
}

function intercambiar(arreglo, i, j, contador) {
  if (i === j) return;
  [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
  contador.swaps++;
}

// ---------------------------------------------------------------------
// Elección del pivote
// ---------------------------------------------------------------------
// Cada función recibe el tramo [inicio, fin] y devuelve la posición del pivote.

// Una posición al azar del tramo (con el generador con semilla).
function pivoteAleatorio(aleatorio) {
  return (inicio, fin) => inicio + Math.floor(aleatorio() * (fin - inicio + 1));
}

// Pivote fijo: el último elemento en Lomuto y el primero en Hoare (la versión
// clásica de cada uno). Es el que se rompe con entradas ya ordenadas.
function pivoteFijo(inicio, fin, tipoDeParticion) {
  return tipoDeParticion === 'lomuto' ? fin : inicio;
}

// ---------------------------------------------------------------------
// Particiones
// ---------------------------------------------------------------------

// LOMUTO: el pivote va al final. `limite` marca dónde termina la zona de los
// menores al pivote. Al terminar el tramo queda así:
//
//     [ menores que el pivote | pivote | mayores o iguales ]
//
// Devuelve la posición final del pivote.
function particionLomuto(arreglo, inicio, fin, elegirPivote, contador) {
  intercambiar(arreglo, elegirPivote(inicio, fin, 'lomuto'), fin, contador);
  const pivote = arreglo[fin];

  let limite = inicio;
  for (let j = inicio; j < fin; j++) {
    contador.comparaciones++;
    if (arreglo[j] < pivote) {
      intercambiar(arreglo, limite, j, contador);
      limite++;
    }
  }

  intercambiar(arreglo, limite, fin, contador); // el pivote a su lugar
  return limite;
}

// HOARE: dos índices avanzan desde los extremos hacia el centro. Cada uno se
// detiene en un elemento que está del lado equivocado (también en los IGUALES
// al pivote) y esos dos se intercambian. Al terminar:
//
//     arreglo[inicio..j] ≤ pivote ≤ arreglo[j+1..fin]
//
// Devuelve j.
function particionHoare(arreglo, inicio, fin, elegirPivote, contador) {
  intercambiar(arreglo, elegirPivote(inicio, fin, 'hoare'), inicio, contador);
  const pivote = arreglo[inicio];

  let i = inicio - 1;
  let j = fin + 1;
  while (true) {
    do {
      i++;
      contador.comparaciones++;
    } while (arreglo[i] < pivote);

    do {
      j--;
      contador.comparaciones++;
    } while (arreglo[j] > pivote);

    if (i >= j) return j;
    intercambiar(arreglo, i, j, contador);
  }
}

// ---------------------------------------------------------------------
// Quickselect
// ---------------------------------------------------------------------
// Deja en arreglo[k] el elemento que estaría en la posición k si el arreglo
// estuviera ordenado, con todo lo de la izquierda ≤ y todo lo de la derecha ≥.
//
// Cada partición descarta el lado que no contiene la posición k. En promedio:
//     n + n/2 + n/4 + … ≈ 2n  →  O(n)

function quickselectLomuto(arreglo, k, elegirPivote, contador) {
  let inicio = 0;
  let fin = arreglo.length - 1;

  while (inicio < fin) {
    contador.particiones++;
    const posicionPivote = particionLomuto(arreglo, inicio, fin, elegirPivote, contador);

    if (k === posicionPivote) break; // el pivote quedó justo en k
    if (k < posicionPivote) {
      fin = posicionPivote - 1; // seguir por la izquierda
    } else {
      inicio = posicionPivote + 1; // seguir por la derecha
    }
  }
  return arreglo[k];
}

function quickselectHoare(arreglo, k, elegirPivote, contador) {
  let inicio = 0;
  let fin = arreglo.length - 1;

  while (inicio < fin) {
    contador.particiones++;
    const corte = particionHoare(arreglo, inicio, fin, elegirPivote, contador);

    if (k <= corte) {
      fin = corte; // k está en la parte izquierda
    } else {
      inicio = corte + 1; // k está en la parte derecha
    }
  }
  return arreglo[k];
}

// ---------------------------------------------------------------------
// Merge Sort (referencia: ordenar todo)
// ---------------------------------------------------------------------
// Versión recursiva con UN solo buffer auxiliar de n elementos (memoria
// adicional Θ(n)). Es estable y cuesta Θ(n log n) para cualquier entrada.
function mergeSort(arreglo, contador) {
  const auxiliar = new Int32Array(arreglo.length);
  contador.memoriaExtra = auxiliar.byteLength;

  function ordenar(inicio, fin) {
    if (inicio >= fin) return;

    const medio = Math.floor((inicio + fin) / 2);
    ordenar(inicio, medio);
    ordenar(medio + 1, fin);

    // Si las dos mitades ya están en orden, no hace falta mezclarlas.
    contador.comparaciones++;
    if (arreglo[medio] <= arreglo[medio + 1]) return;

    mezclar(inicio, medio, fin);
  }

  // Mezcla las mitades ordenadas [inicio..medio] y [medio+1..fin].
  function mezclar(inicio, medio, fin) {
    for (let t = inicio; t <= fin; t++) {
      auxiliar[t] = arreglo[t];
    }
    contador.movimientos += fin - inicio + 1;

    let izquierda = inicio;
    let derecha = medio + 1;
    for (let t = inicio; t <= fin; t++) {
      if (izquierda > medio) {
        arreglo[t] = auxiliar[derecha++]; //         se terminó la mitad izquierda
      } else if (derecha > fin) {
        arreglo[t] = auxiliar[izquierda++]; //       se terminó la mitad derecha
      } else {
        contador.comparaciones++;
        if (auxiliar[derecha] < auxiliar[izquierda]) {
          arreglo[t] = auxiliar[derecha++];
        } else {
          arreglo[t] = auxiliar[izquierda++]; //     ante empate, la izquierda (estable)
        }
      }
      contador.movimientos++;
    }
  }

  ordenar(0, arreglo.length - 1);
  return arreglo;
}

// ---------------------------------------------------------------------
// Búsqueda binaria (para validar)
// ---------------------------------------------------------------------
// Sobre el arreglo ORDENADO:
//   cantidadMenores(v)       = cuántos elementos son < v
//   cantidadMenoresOIguales(v) = cuántos elementos son ≤ v
// v está en la posición k (contando desde 0) ⇔ cantidadMenores(v) ≤ k < cantidadMenoresOIguales(v)

function cantidadMenores(ordenado, valor, contador = { comparaciones: 0 }) {
  return primeraPosicionQueNoCumple(ordenado, (x) => x < valor, contador);
}

function cantidadMenoresOIguales(ordenado, valor, contador = { comparaciones: 0 }) {
  return primeraPosicionQueNoCumple(ordenado, (x) => x <= valor, contador);
}

// En un arreglo ordenado, los que cumplen la condición están todos al principio:
// se busca dónde termina ese bloque partiendo el rango a la mitad cada vez.
function primeraPosicionQueNoCumple(ordenado, cumple, contador) {
  let desde = 0;
  let hasta = ordenado.length;
  while (desde < hasta) {
    const medio = Math.floor((desde + hasta) / 2);
    contador.comparaciones++;
    if (cumple(ordenado[medio])) {
      desde = medio + 1;
    } else {
      hasta = medio;
    }
  }
  return desde;
}

// ---------------------------------------------------------------------
// Convención de percentil
// ---------------------------------------------------------------------
// Percentil p por "rango más cercano": el menor valor tal que al menos el p %
// de los datos es ≤ a él → posición k = ⌈p·n/100⌉ − 1 (contando desde 0).
function posicionDelPercentil(p, n) {
  return Math.ceil((p * n) / 100) - 1;
}

module.exports = {
  nuevoContador,
  pivoteAleatorio,
  pivoteFijo,
  particionLomuto,
  particionHoare,
  quickselectLomuto,
  quickselectHoare,
  mergeSort,
  cantidadMenores,
  cantidadMenoresOIguales,
  posicionDelPercentil,
};
