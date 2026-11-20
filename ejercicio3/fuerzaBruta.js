// Brute Force String Match en 8 direcciones — Fuerza Bruta / Búsqueda Exhaustiva (Unidad 3)
//
// El String Match por fuerza bruta clásico alinea el patrón en cada posición
// del texto y compara carácter por carácter hasta encontrar una diferencia.
// En la sopa de letras el "texto" es la matriz: se alinea la palabra en CADA
// celda y en CADA una de las 8 direcciones, y se compara letra a letra.
// Al primer carácter distinto se descarta esa alineación (no se sigue comparando).
//
// Es búsqueda exhaustiva: se revisan todas las alineaciones posibles, una sola
// vez cada una, así que no se puede omitir ninguna aparición.
//
// Complejidad (peor caso), para una matriz R × C y una palabra de largo m:
//   O(R · C · 8 · m)  →  con R = C = n:  O(n² · m)
// En la práctica casi todas las alineaciones fallan en la 1.ª o 2.ª letra,
// por lo que el costo real se acerca a O(n²) por palabra.

const DIRECCIONES = [
  { nombre: 'derecha →', df: 0, dc: 1 },
  { nombre: 'izquierda ←', df: 0, dc: -1 },
  { nombre: 'abajo ↓', df: 1, dc: 0 },
  { nombre: 'arriba ↑', df: -1, dc: 0 },
  { nombre: 'diagonal ↘', df: 1, dc: 1 },
  { nombre: 'diagonal ↖', df: -1, dc: -1 },
  { nombre: 'diagonal ↙', df: 1, dc: -1 },
  { nombre: 'diagonal ↗', df: -1, dc: 1 },
];

// Busca todas las apariciones de `palabra` en `matriz`.
// Devuelve { apariciones: [{fila, col, direccion, celdas}], comparaciones, alineaciones }
function buscarPalabra(matriz, palabra) {
  const R = matriz.length;
  const C = matriz[0].length;
  const m = palabra.length;
  const apariciones = [];
  let comparaciones = 0;
  let alineaciones = 0;

  for (let f = 0; f < R; f++) {
    for (let c = 0; c < C; c++) {
      for (const dir of DIRECCIONES) {
        // ¿Entra la palabra completa en esta dirección? (si no, ni se intenta)
        const fFin = f + dir.df * (m - 1);
        const cFin = c + dir.dc * (m - 1);
        if (fFin < 0 || fFin >= R || cFin < 0 || cFin >= C) continue;

        alineaciones++;
        let k = 0;
        // Comparación carácter a carácter, como en el String Match clásico
        while (k < m) {
          comparaciones++;
          if (matriz[f + dir.df * k][c + dir.dc * k] !== palabra[k]) break;
          k++;
        }
        if (k === m) {
          const celdas = Array.from({ length: m }, (_, i) => [f + dir.df * i, c + dir.dc * i]);
          apariciones.push({ fila: f, col: c, direccion: dir.nombre, celdas });
        }
      }
    }
  }
  return { apariciones, comparaciones, alineaciones };
}

module.exports = { DIRECCIONES, buscarPalabra };
