// Carga del arreglo P[0..n-1] desde datos_1mill_n.txt (un entero por línea).
// Se usa Int32Array: 4 bytes por elemento, memoria contigua y acceso rápido.

const fs = require('fs');
const path = require('path');

const ARCHIVO = path.join(__dirname, 'datos_1mill_n.txt');

function cargarDatos(archivo = ARCHIVO) {
  const lineas = fs.readFileSync(archivo, 'utf8').split(/\r?\n/);
  const P = new Int32Array(lineas.length);
  let n = 0;
  for (const linea of lineas) {
    const t = linea.trim();
    if (t !== '') P[n++] = Number(t);
  }
  return P.subarray(0, n);
}

module.exports = { cargarDatos, ARCHIVO };
