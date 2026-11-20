// =====================================================================
// Brute Force String Match en 8 direcciones — Fuerza Bruta (Unidad 3)
// =====================================================================
//
// El String Match por fuerza bruta clásico pone el patrón en cada posición del
// texto y compara letra por letra hasta encontrar una diferencia.
//
// En la sopa de letras el "texto" es la matriz: la palabra se pone en CADA
// celda y en CADA una de las 8 direcciones, y se compara letra por letra.
// En la primera letra distinta se abandona ese intento.
//
// Es una búsqueda exhaustiva: se prueban todas las ubicaciones posibles, una
// sola vez cada una, así que no se puede perder ninguna aparición.
//
// Complejidad (peor caso), para una matriz de F filas × C columnas y una
// palabra de m letras:  O(F · C · 8 · m).
// En la práctica casi todos los intentos fallan en la 1.ª o 2.ª letra, así que
// el costo real se acerca a O(F · C) por palabra.

// Cada dirección indica cuánto se avanza en filas y en columnas por cada letra.
const DIRECCIONES = [
  { nombre: 'derecha →', pasoFila: 0, pasoColumna: 1 },
  { nombre: 'izquierda ←', pasoFila: 0, pasoColumna: -1 },
  { nombre: 'abajo ↓', pasoFila: 1, pasoColumna: 0 },
  { nombre: 'arriba ↑', pasoFila: -1, pasoColumna: 0 },
  { nombre: 'diagonal ↘', pasoFila: 1, pasoColumna: 1 },
  { nombre: 'diagonal ↖', pasoFila: -1, pasoColumna: -1 },
  { nombre: 'diagonal ↙', pasoFila: 1, pasoColumna: -1 },
  { nombre: 'diagonal ↗', pasoFila: -1, pasoColumna: 1 },
];

// Busca todas las apariciones de `palabra` en `matriz`.
// Devuelve las apariciones y cuántos intentos y comparaciones se hicieron.
function buscarPalabra(matriz, palabra) {
  const cantidadFilas = matriz.length;
  const cantidadColumnas = matriz[0].length;

  const apariciones = [];
  let comparaciones = 0;
  let alineaciones = 0; // intentos de ubicar la palabra (celda + dirección)

  for (let fila = 0; fila < cantidadFilas; fila++) {
    for (let columna = 0; columna < cantidadColumnas; columna++) {
      for (const direccion of DIRECCIONES) {
        // Si la palabra no entra completa en esa dirección, ni se intenta.
        if (!entraEnLaMatriz(matriz, palabra, fila, columna, direccion)) continue;

        alineaciones++;
        const intento = compararLetraPorLetra(matriz, palabra, fila, columna, direccion);
        comparaciones += intento.comparaciones;

        if (intento.coincide) {
          apariciones.push({
            fila,
            columna,
            direccion: direccion.nombre,
            celdas: celdasDeLaPalabra(palabra, fila, columna, direccion),
          });
        }
      }
    }
  }

  return { apariciones, comparaciones, alineaciones };
}

// ¿La última letra de la palabra caería dentro de la matriz?
function entraEnLaMatriz(matriz, palabra, fila, columna, { pasoFila, pasoColumna }) {
  const ultimaFila = fila + pasoFila * (palabra.length - 1);
  const ultimaColumna = columna + pasoColumna * (palabra.length - 1);
  return (
    ultimaFila >= 0 && ultimaFila < matriz.length &&
    ultimaColumna >= 0 && ultimaColumna < matriz[0].length
  );
}

// Compara la palabra con la matriz a partir de (fila, columna) en una dirección.
// Corta en la primera letra distinta, como el String Match clásico.
function compararLetraPorLetra(matriz, palabra, fila, columna, { pasoFila, pasoColumna }) {
  let comparaciones = 0;
  for (let k = 0; k < palabra.length; k++) {
    comparaciones++;
    const letraEnMatriz = matriz[fila + pasoFila * k][columna + pasoColumna * k];
    if (letraEnMatriz !== palabra[k]) {
      return { coincide: false, comparaciones };
    }
  }
  return { coincide: true, comparaciones };
}

// Las posiciones [fila, columna] de cada letra de una aparición.
function celdasDeLaPalabra(palabra, fila, columna, { pasoFila, pasoColumna }) {
  const celdas = [];
  for (let k = 0; k < palabra.length; k++) {
    celdas.push([fila + pasoFila * k, columna + pasoColumna * k]);
  }
  return celdas;
}

module.exports = { DIRECCIONES, buscarPalabra };
