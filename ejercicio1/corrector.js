// Ejercicio 1 — Corrector ortográfico con distancia de Levenshtein
// Uso: node corrector.js

const PALABRA = 'programaceón';
const DICCIONARIO = [
  'programación',
  'programador',
  'programaciónes',
  'programaciónal',
  'programación web',
  'probabilístico',
];
const UMBRAL = 3;

// Normalizamos a NFC para que "ó" sea un solo carácter, y usamos Array.from
// para recorrer por caracteres (no por unidades UTF-16).
const chars = (s) => Array.from(s.normalize('NFC'));

/**
 * Construye la matriz completa D de (m+1) x (n+1).
 * D[i][j] = distancia entre los primeros i caracteres de origen
 *           y los primeros j caracteres de destino.
 *
 * Caso base:  D[i][0] = i  (i eliminaciones)
 *             D[0][j] = j  (j inserciones)
 * Recurrencia:
 *   D[i][j] = min( D[i-1][j]   + 1,           // eliminación
 *                  D[i][j-1]   + 1,           // inserción
 *                  D[i-1][j-1] + costo )      // sustitución (costo 0 si coinciden)
 */
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
      const eliminacion = D[i - 1][j] + 1;
      const insercion = D[i][j - 1] + 1;
      const sustitucion = D[i - 1][j - 1] + costo;
      D[i][j] = Math.min(eliminacion, insercion, sustitucion);
    }
  }
  return { D, a, b };
}

/**
 * Reconstruye el camino óptimo desde D[m][n] hasta D[0][0].
 * En cada celda elige el predecesor que explica su valor
 * (prioridad: diagonal, luego eliminación, luego inserción).
 * Devuelve las operaciones en orden de aplicación (de izquierda a derecha).
 */
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
            ? { tipo: 'coincidencia', desc: `'${a[i - 1]}' = '${b[j - 1]}'`, costo: 0 }
            : { tipo: 'sustitución', desc: `'${a[i - 1]}' → '${b[j - 1]}' (posición ${i})`, costo: 1 }
        );
        i--; j--;
        camino.push([i, j]);
        continue;
      }
    }
    if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
      ops.push({ tipo: 'eliminación', desc: `eliminar '${a[i - 1]}' (posición ${i})`, costo: 1 });
      i--;
    } else {
      ops.push({ tipo: 'inserción', desc: `insertar '${b[j - 1]}' (después de la posición ${i})`, costo: 1 });
      j--;
    }
    camino.push([i, j]);
  }

  ops.reverse();
  camino.reverse();
  return { ops, camino };
}

// ---------- Presentación ----------

function imprimirMatriz(D, a, b, camino) {
  const enCamino = new Set(camino.map(([i, j]) => `${i},${j}`));
  const ancho = 4;
  const celda = (v) => String(v).padStart(ancho);
  let encabezado = ' '.repeat(ancho * 2) + b.map((c) => celda(c)).join('');
  console.log(encabezado);
  for (let i = 0; i < D.length; i++) {
    const etiqueta = i === 0 ? 'ε' : a[i - 1];
    let fila = celda(etiqueta);
    for (let j = 0; j < D[i].length; j++) {
      const v = enCamino.has(`${i},${j}`) ? `[${D[i][j]}]` : `${D[i][j]}`;
      fila += celda(v);
    }
    if (i === 0) {
      // fila ε: insertamos la etiqueta de columna ε
      fila = celda('ε') + celda(enCamino.has('0,0') ? '[0]' : '0') + D[0].slice(1).map((v, k) => celda(enCamino.has(`0,${k + 1}`) ? `[${v}]` : v)).join('');
    }
    console.log(fila);
  }
  console.log('  (entre corchetes: celdas del camino óptimo)');
}

function imprimirOperaciones(ops) {
  let paso = 0;
  for (const op of ops) {
    if (op.tipo === 'coincidencia') continue;
    paso++;
    console.log(`  ${paso}. ${op.tipo.toUpperCase()}: ${op.desc}  (+${op.costo})`);
  }
  if (paso === 0) console.log('  (sin operaciones: las palabras son iguales)');
  const coincidencias = ops.filter((o) => o.tipo === 'coincidencia').length;
  console.log(`  Coincidencias (costo 0): ${coincidencias}`);
}

// ---------- Programa principal ----------

console.log(`Palabra a corregir: "${PALABRA}"\n`);

const resultados = DICCIONARIO.map((palabra, indice) => {
  const { D, a, b } = construirMatriz(PALABRA, palabra);
  const distancia = D[a.length][b.length];
  const { ops, camino } = reconstruirCamino(D, a, b);
  return { palabra, indice, distancia, D, a, b, ops, camino };
});

for (const r of resultados) {
  console.log('='.repeat(70));
  console.log(`"${PALABRA}" → "${r.palabra}"   distancia = ${r.distancia}`);
  console.log('='.repeat(70));
  imprimirMatriz(r.D, r.a, r.b, r.camino);
  console.log('\nCamino óptimo (de (0,0) a (m,n)):');
  console.log('  ' + r.camino.map(([i, j]) => `(${i},${j})`).join(' → '));
  console.log('\nOperaciones, en orden:');
  imprimirOperaciones(r.ops);
  console.log();
}

console.log('='.repeat(70));
console.log('Resumen de distancias');
console.log('='.repeat(70));
for (const r of resultados) {
  const marca = r.distancia <= UMBRAL ? '✔' : '✘';
  console.log(`  ${marca} ${r.palabra.padEnd(18)} ${r.distancia}`);
}

// Selección (≤ UMBRAL) y orden por distancia; empate → orden del diccionario
const candidatas = resultados
  .filter((r) => r.distancia <= UMBRAL)
  .sort((x, y) => x.distancia - y.distancia || x.indice - y.indice);

console.log('\n¿Quisiste decir?\n');
if (candidatas.length === 0) {
  console.log('  No se encontraron sugerencias.');
} else {
  candidatas.forEach((r, k) => console.log(`${k + 1}. ${r.palabra} (distancia = ${r.distancia})`));
}
