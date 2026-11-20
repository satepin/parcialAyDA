// Distancia de Levenshtein — Programación Dinámica (Unidad 7), versión TABULACIÓN (bottom-up)
//
// Pasos de PD (según la teoría):
//  1. Estado:     D[i][j] = mínimo de operaciones para transformar los primeros i
//                 caracteres del origen en los primeros j caracteres del destino.
//  2. Casos base: D[i][0] = i  (borrar i letras)   ("gato" → "" : 4 borrados)
//                 D[0][j] = j  (insertar j letras) (""     → "pato": 4 inserciones)
//  3. Recurrencia (miramos los tres vecinos y elegimos el mínimo):
//       ↑ arriba    D[i-1][j]   + 1  → BORRAR
//       ← izquierda D[i][j-1]   + 1  → INSERTAR
//       ↖ diagonal  D[i-1][j-1] + 0  si las letras son iguales (se copia la diagonal)
//                   D[i-1][j-1] + 1  si son distintas → SUSTITUIR
//  4. Respuesta:  D[m][n] (última celda) y reconstrucción del camino hacia atrás.
//
// Complejidad: tiempo O(m·n), espacio O(m·n) (la matriz completa es necesaria
// para reconstruir el camino).

// "ó" como un solo carácter (NFC) y recorrido por caracteres, no por unidades UTF-16.
const chars = (s) => Array.from(s.normalize('NFC'));

function construirMatriz(origen, destino) {
  const a = chars(origen);
  const b = chars(destino);
  const m = a.length;
  const n = b.length;
  const D = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) D[i][0] = i;
  for (let j = 0; j <= n; j++) D[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      D[i][j] = Math.min(
        D[i - 1][j] + 1, //        ↑ borrar
        D[i][j - 1] + 1, //        ← insertar
        D[i - 1][j - 1] + costo // ↖ sustituir / coincidencia
      );
    }
  }
  return { D, a, b };
}

// Solo la distancia (la usan el BK-Tree y la búsqueda exhaustiva).
function distancia(origen, destino) {
  const { D, a, b } = construirMatriz(origen, destino);
  return D[a.length][b.length];
}

// Reconstruye el camino óptimo desde D[m][n] hasta D[0][0].
// En cada celda se busca qué vecino explica su valor (prioridad ↖, ↑, ←).
// Devuelve las operaciones en el orden en que se aplican (de izquierda a derecha).
function reconstruirCamino(D, a, b) {
  let i = a.length;
  let j = b.length;
  const camino = [[i, j]];
  const ops = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      if (D[i][j] === D[i - 1][j - 1] + costo) {
        ops.push(
          costo === 0
            ? { tipo: 'coincidencia', flecha: '↖', desc: `'${a[i - 1]}' = '${b[j - 1]}' (se copia la diagonal)`, costo: 0 }
            : { tipo: 'sustitución', flecha: '↖', desc: `'${a[i - 1]}' → '${b[j - 1]}' (posición ${i})`, costo: 1 }
        );
        i--; j--;
        camino.push([i, j]);
        continue;
      }
    }
    if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
      ops.push({ tipo: 'eliminación', flecha: '↑', desc: `borrar '${a[i - 1]}' (posición ${i})`, costo: 1 });
      i--;
    } else {
      ops.push({ tipo: 'inserción', flecha: '←', desc: `insertar '${b[j - 1]}' (después de la posición ${i})`, costo: 1 });
      j--;
    }
    camino.push([i, j]);
  }

  ops.reverse();
  camino.reverse();
  return { ops, camino };
}

module.exports = { chars, construirMatriz, distancia, reconstruirCamino };
