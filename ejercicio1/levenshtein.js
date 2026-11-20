// =====================================================================
// Distancia de Levenshtein — Programación Dinámica (Unidad 7)
// =====================================================================
//
// La distancia de Levenshtein es la cantidad mínima de operaciones
// (insertar, borrar o sustituir una letra) para convertir una palabra en otra.
//
// Se resuelve con PROGRAMACIÓN DINÁMICA por TABULACIÓN (de abajo hacia arriba):
//
//   1. Estado:      matriz[i][j] = distancia entre las primeras i letras del
//                   origen y las primeras j letras del destino.
//
//   2. Casos base:  matriz[i][0] = i   (para llegar a "" hay que borrar i letras)
//                   matriz[0][j] = j   (desde "" hay que insertar j letras)
//
//   3. Recurrencia: se miran los tres vecinos ya calculados y se elige el menor.
//        ↑ arriba     matriz[i-1][j]   + 1   → BORRAR
//        ← izquierda  matriz[i][j-1]   + 1   → INSERTAR
//        ↖ diagonal   matriz[i-1][j-1] + 0   si las letras son iguales
//                     matriz[i-1][j-1] + 1   si son distintas → SUSTITUIR
//
//   4. Respuesta:   la última celda, matriz[m][n]. Después se reconstruye el
//                   camino óptimo desde esa celda hasta matriz[0][0].
//
// Complejidad: tiempo O(m·n) y espacio O(m·n). La matriz completa se guarda
// porque hace falta para reconstruir el camino.
//
// Criterio de la consigna: las vocales con tilde cuentan igual que sin tilde
// (ó = o, á = a, …). La ñ NO se modifica, porque en castellano es otra letra.

const VOCAL_SIN_TILDE = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u',
  Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U',
};

// Separa una palabra en letras. normalize('NFC') hace que "ó" sea UNA letra
// (y no una "o" más un acento suelto).
function separarEnLetras(palabra) {
  return Array.from(palabra.normalize('NFC'));
}

// Devuelve la letra sin tilde: 'ó' → 'o'. Las demás letras quedan igual.
function sinTilde(letra) {
  return VOCAL_SIN_TILDE[letra] ?? letra;
}

// Dos letras son iguales si coinciden ignorando la tilde.
function sonIguales(letraA, letraB) {
  return sinTilde(letraA) === sinTilde(letraB);
}

function normalizar(palabra) {
  return separarEnLetras(palabra).map(sinTilde).join('');
}

// ---------------------------------------------------------------------
// Construcción de la matriz completa
// ---------------------------------------------------------------------
// Devuelve la matriz y las letras de cada palabra (con su tilde original,
// para poder mostrarlas; solo la comparación la ignora).
function construirMatriz(origen, destino) {
  const letrasOrigen = separarEnLetras(origen);
  const letrasDestino = separarEnLetras(destino);
  const filas = letrasOrigen.length;
  const columnas = letrasDestino.length;

  // Matriz de (filas + 1) × (columnas + 1), con una fila y una columna extra
  // para la palabra vacía "".
  const matriz = [];
  for (let i = 0; i <= filas; i++) {
    matriz.push(new Array(columnas + 1).fill(0));
  }

  // Casos base
  for (let i = 0; i <= filas; i++) {
    matriz[i][0] = i;
  }
  for (let j = 0; j <= columnas; j++) {
    matriz[0][j] = j;
  }

  // Relleno, fila por fila, aplicando la recurrencia
  for (let i = 1; i <= filas; i++) {
    for (let j = 1; j <= columnas; j++) {
      const costoSustitucion = sonIguales(letrasOrigen[i - 1], letrasDestino[j - 1]) ? 0 : 1;

      const porBorrado = matriz[i - 1][j] + 1; //                   ↑
      const porInsercion = matriz[i][j - 1] + 1; //                 ←
      const porSustitucion = matriz[i - 1][j - 1] + costoSustitucion; // ↖

      matriz[i][j] = Math.min(porBorrado, porInsercion, porSustitucion);
    }
  }

  return { matriz, letrasOrigen, letrasDestino };
}

// Solo la distancia (la usa el BK-Tree, que no necesita el camino).
function distancia(origen, destino) {
  const { matriz, letrasOrigen, letrasDestino } = construirMatriz(origen, destino);
  return matriz[letrasOrigen.length][letrasDestino.length];
}

// ---------------------------------------------------------------------
// Reconstrucción del camino óptimo
// ---------------------------------------------------------------------
// Se parte de la última celda y, en cada paso, se busca qué vecino explica el
// valor de la celda actual (se prueba primero la diagonal, después arriba y
// por último la izquierda). Cada paso corresponde a una operación.
//
// Devuelve:
//   - operaciones: en el orden en que se aplican (de la primera letra a la última)
//   - camino: las celdas recorridas, desde (0,0) hasta (m,n)
function reconstruirCamino(matriz, letrasOrigen, letrasDestino) {
  let i = letrasOrigen.length;
  let j = letrasDestino.length;
  const camino = [[i, j]];
  const operaciones = [];

  while (i > 0 || j > 0) {
    const letraOrigen = letrasOrigen[i - 1];
    const letraDestino = letrasDestino[j - 1];

    if (vieneDeLaDiagonal(matriz, i, j, letraOrigen, letraDestino)) {
      if (sonIguales(letraOrigen, letraDestino)) {
        operaciones.push(coincidencia(letraOrigen, letraDestino));
      } else {
        operaciones.push(sustitucion(letraOrigen, letraDestino, i));
      }
      i--;
      j--;
    } else if (vieneDeArriba(matriz, i, j)) {
      operaciones.push(borrado(letraOrigen, i));
      i--;
    } else {
      operaciones.push(insercion(letraDestino, i));
      j--;
    }
    camino.push([i, j]);
  }

  // Se reconstruyó de atrás hacia adelante: se invierte para leerlo en orden.
  operaciones.reverse();
  camino.reverse();
  return { operaciones, camino };
}

function vieneDeLaDiagonal(matriz, i, j, letraOrigen, letraDestino) {
  if (i === 0 || j === 0) return false;
  const costo = sonIguales(letraOrigen, letraDestino) ? 0 : 1;
  return matriz[i][j] === matriz[i - 1][j - 1] + costo;
}

function vieneDeArriba(matriz, i, j) {
  return i > 0 && matriz[i][j] === matriz[i - 1][j] + 1;
}

// --- Descripción de cada operación ---

function coincidencia(letraOrigen, letraDestino) {
  const ignoraTilde = letraOrigen !== letraDestino; // 'ó' frente a 'o'
  const aclaracion = ignoraTilde ? ', se ignora la tilde' : '';
  return {
    tipo: 'coincidencia',
    flecha: '↖',
    letras: `'${letraOrigen}' = '${letraDestino}'`,
    descripcion: `'${letraOrigen}' = '${letraDestino}' (se copia la diagonal${aclaracion})`,
    costo: 0,
    ignoraTilde,
  };
}

function sustitucion(letraOrigen, letraDestino, posicion) {
  return {
    tipo: 'sustitución',
    flecha: '↖',
    descripcion: `'${letraOrigen}' → '${letraDestino}' (posición ${posicion})`,
    costo: 1,
  };
}

function borrado(letra, posicion) {
  return {
    tipo: 'eliminación',
    flecha: '↑',
    descripcion: `borrar '${letra}' (posición ${posicion})`,
    costo: 1,
  };
}

function insercion(letra, posicion) {
  return {
    tipo: 'inserción',
    flecha: '←',
    descripcion: `insertar '${letra}' (después de la posición ${posicion})`,
    costo: 1,
  };
}

module.exports = { separarEnLetras, normalizar, construirMatriz, distancia, reconstruirCamino };
