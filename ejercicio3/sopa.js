// =====================================================================
// Ejercicio 3 — Búsqueda de palabras en una sopa de letras
// =====================================================================
// Uso: node sopa.js            (o desde el menú: node index.js)
//      node sopa.js DFS RED    (busca además esas palabras, sin preguntar)
//
// 1. Algoritmo elegido: Brute Force String Match (U3, Fuerza Bruta), extendido
//    a las 8 direcciones (horizontal, vertical y diagonales, en ambos sentidos).
//    Motivos:
//      - Es el algoritmo de búsqueda de patrones que da la teoría (U3).
//      - Es exhaustivo: garantiza encontrar TODAS las apariciones.
//      - La matriz es chica (20 × 20 = 400 celdas) y las palabras cortas, así
//        que su costo es mínimo y no justifica una técnica más compleja.
// 2. Palabras de la consigna: ARBOL, HEAPS, SORTS, NODOS, GRAFO.
// 3. Adición: buscar palabras nuevas con el mismo algoritmo.

const readline = require('readline/promises');
const { MATRIZ, PALABRAS } = require('./matriz');
const { DIRECCIONES, buscarPalabra } = require('./fuerzaBruta');

const ANCHO_LINEA = 64;
const CANTIDAD_FILAS = MATRIZ.length;
const CANTIDAD_COLUMNAS = MATRIZ[0].length;

// ---------------------------------------------------------------------
// Programa principal
// ---------------------------------------------------------------------

// `rl` es la lectura de teclado que comparte el menú (si se ejecuta desde ahí).
async function main({ rl } = {}) {
  explicarAlgoritmo();

  titulo(`MATRIZ (${CANTIDAD_FILAS} × ${CANTIDAD_COLUMNAS})`);
  imprimirMatriz(MATRIZ);

  const resultados = buscarPalabrasDeLaConsigna();
  mostrarUbicaciones(resultados);
  mostrarResumen(resultados);

  await buscarPalabrasNuevas(rl);
}

function explicarAlgoritmo() {
  titulo('ALGORITMO: Brute Force String Match en 8 direcciones (U3)');
  console.log('Para cada palabra, cada celda (f, c) y cada dirección (df, dc):');
  console.log('  comparar matriz[f + df·k][c + dc·k] con palabra[k], k = 0..m-1');
  console.log('  y cortar en la primera letra distinta.');
  console.log('Direcciones: ' + DIRECCIONES.map((d) => d.nombre).join(', '));
  console.log('Complejidad: O(R · C · 8 · m) por palabra.');
}

// ---------------------------------------------------------------------
// Palabras de la consigna
// ---------------------------------------------------------------------

function buscarPalabrasDeLaConsigna() {
  titulo('RESULTADOS');

  const resultados = [];
  for (const palabra of PALABRAS) {
    const { apariciones, comparaciones, alineaciones } = buscarPalabra(MATRIZ, palabra);

    console.log(`\n${palabra}`);
    if (apariciones.length === 0) {
      console.log('  No se encontró.');
    }
    for (const aparicion of apariciones) {
      console.log(`  Inicio ${posicion(inicioDe(aparicion))} → fin ${posicion(finDe(aparicion))}   dirección: ${aparicion.direccion}`);
      console.log(`  Celdas: ${describirCeldas(palabra, aparicion)}`);
    }
    console.log(`  Alineaciones probadas: ${alineaciones}   comparaciones de caracteres: ${comparaciones}`);

    resultados.push({ palabra, apariciones, comparaciones });
  }
  return resultados;
}

function mostrarUbicaciones(resultados) {
  titulo('UBICACIÓN DE LAS PALABRAS EN LA MATRIZ');

  const celdasMarcadas = new Set();
  for (const { apariciones } of resultados) {
    marcarCeldas(celdasMarcadas, apariciones);
  }
  imprimirMatriz(MATRIZ, celdasMarcadas);
}

function mostrarResumen(resultados) {
  titulo('RESUMEN');

  for (const { palabra, apariciones } of resultados) {
    const primera = apariciones[0];
    const marca = primera ? '✔' : '✘';
    const donde = primera ? `${posicion(inicioDe(primera))} ${primera.direccion}` : 'no encontrada';
    const extras = apariciones.length > 1 ? `  (+${apariciones.length - 1} más)` : '';
    console.log(`  ${marca} ${palabra.padEnd(6)} ${donde}${extras}`);
  }

  const encontradas = resultados.filter((r) => r.apariciones.length > 0).length;
  const totalComparaciones = resultados.reduce((suma, r) => suma + r.comparaciones, 0);
  console.log(`\nEncontradas: ${encontradas} de ${PALABRAS.length}`);
  console.log(`Comparaciones de caracteres en total: ${totalComparaciones}`);
}

// ---------------------------------------------------------------------
// Adición: buscar palabras nuevas
// ---------------------------------------------------------------------

async function buscarPalabrasNuevas(rlDelMenu) {
  titulo('BUSCAR UNA PALABRA NUEVA (mismo algoritmo)');

  // Caso 1: palabras pasadas por línea de comandos (node sopa.js DFS RED)
  const palabrasDeLaLinea = require.main === module ? process.argv.slice(2) : [];
  if (palabrasDeLaLinea.length > 0) {
    palabrasDeLaLinea.forEach(buscarPalabraNueva);
    return;
  }

  // Caso 2: se pregunta por teclado. Desde el menú se usa su lectura; si se
  // ejecuta solo en una terminal, se abre una propia.
  let rl = rlDelMenu;
  let rlPropio = null;
  if (!rl && require.main === module && process.stdin.isTTY) {
    rlPropio = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl = rlPropio;
  }

  // Caso 3: sin teclado (por ejemplo, con la salida guardada en un archivo)
  if (!rl) {
    console.log('  Para buscar otra palabra: ejecutá desde el menú, o node ejercicio3/sopa.js DFS RED');
    return;
  }

  console.log('  Escribí una palabra para buscarla en la matriz (Enter vacío para terminar).');
  console.log('  Se ignoran mayúsculas y tildes. Ejemplos: DFS, RED, SOL.');
  try {
    while (true) {
      const texto = await rl.question('\nPalabra a buscar: ');
      if (texto.trim() === '') break;
      buscarPalabraNueva(texto);
    }
  } finally {
    if (rlPropio) rlPropio.close();
  }
}

// Valida la palabra, la busca y muestra dónde aparece.
function buscarPalabraNueva(texto) {
  const palabra = normalizarPalabra(texto);
  const largoMaximo = Math.max(CANTIDAD_FILAS, CANTIDAD_COLUMNAS);

  if (!/^[A-ZÑ]+$/.test(palabra)) {
    console.log(`  "${texto.trim()}" no es válida: usá solo letras, sin espacios.`);
    return;
  }
  if (palabra.length < 2 || palabra.length > largoMaximo) {
    console.log(`  La palabra debe tener entre 2 y ${largoMaximo} letras (la matriz es de ${CANTIDAD_FILAS} × ${CANTIDAD_COLUMNAS}).`);
    return;
  }

  const { apariciones, comparaciones, alineaciones } = buscarPalabra(MATRIZ, palabra);

  console.log(`\n${palabra}`);
  if (apariciones.length === 0) {
    console.log('  No se encontró en ninguna de las 8 direcciones.');
  }
  apariciones.forEach((aparicion, indice) => {
    const numero = apariciones.length > 1 ? `${indice + 1}) ` : '';
    console.log(`  ${numero}Inicio ${posicion(inicioDe(aparicion))} → fin ${posicion(finDe(aparicion))}   dirección: ${aparicion.direccion}`);
    console.log(`     Celdas: ${describirCeldas(palabra, aparicion)}`);
  });
  console.log(`  Apariciones: ${apariciones.length}   alineaciones probadas: ${conPuntos(alineaciones)}   comparaciones: ${conPuntos(comparaciones)}`);

  if (apariciones.length > 0) {
    const celdasMarcadas = new Set();
    marcarCeldas(celdasMarcadas, apariciones);
    console.log('  (solo las filas donde aparece)');
    imprimirMatriz(MATRIZ, celdasMarcadas, { soloFilasMarcadas: true });
  }
}

// La matriz solo tiene mayúsculas sin tilde: se pasa a mayúsculas y se quitan
// las tildes. La Ñ se protege antes, porque normalize('NFD') la separaría en
// N + virgulilla.
function normalizarPalabra(texto) {
  const MARCA_ENIE = '\u0000';
  return texto
    .trim()
    .toUpperCase()
    .replace(/Ñ/g, MARCA_ENIE)
    .normalize('NFD') //               separa cada letra de su tilde
    .replace(/[̀-ͯ]/g, '') // borra las tildes sueltas
    .replace(new RegExp(MARCA_ENIE, 'g'), 'Ñ');
}

// ---------------------------------------------------------------------
// Ayudas de formato
// ---------------------------------------------------------------------

// Las filas y columnas se muestran contando desde 1.
function posicion([fila, columna]) {
  return `(${fila + 1},${columna + 1})`;
}

function inicioDe(aparicion) {
  return aparicion.celdas[0];
}

function finDe(aparicion) {
  return aparicion.celdas[aparicion.celdas.length - 1];
}

// "A(2,12) R(2,13) …": cada letra con su posición.
function describirCeldas(palabra, aparicion) {
  return aparicion.celdas.map((celda, k) => `${palabra[k]}${posicion(celda)}`).join(' ');
}

function marcarCeldas(celdasMarcadas, apariciones) {
  for (const aparicion of apariciones) {
    for (const [fila, columna] of aparicion.celdas) {
      celdasMarcadas.add(`${fila},${columna}`);
    }
  }
}

// Sin celdas marcadas muestra la matriz completa; con celdas marcadas muestra
// solo esas letras y un punto en el resto.
function imprimirMatriz(matriz, celdasMarcadas = null, { soloFilasMarcadas = false } = {}) {
  const celda = (texto) => String(texto).padStart(3);
  const estaMarcada = (fila, columna) => celdasMarcadas.has(`${fila},${columna}`);

  const numerosDeColumna = matriz[0].map((_, columna) => celda(columna + 1));
  console.log('     ' + numerosDeColumna.join(''));

  matriz.forEach((letras, fila) => {
    if (soloFilasMarcadas && !letras.some((_, columna) => estaMarcada(fila, columna))) return;

    const celdas = letras.map((letra, columna) => {
      if (celdasMarcadas === null) return celda(letra);
      return celda(estaMarcada(fila, columna) ? letra : '·');
    });
    console.log(String(fila + 1).padStart(4) + ' ' + celdas.join(''));
  });
}

function conPuntos(numero) {
  return numero.toLocaleString('es-AR');
}

function titulo(texto) {
  const linea = '='.repeat(ANCHO_LINEA);
  console.log(`\n${linea}\n${texto}\n${linea}`);
}

module.exports = { main, normalizarPalabra };

// Permite ejecutarlo solo: node ejercicio3/sopa.js [palabras extra...]
if (require.main === module) main();
