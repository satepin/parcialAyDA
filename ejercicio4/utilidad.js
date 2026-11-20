// =====================================================================
// Ejercicio 4 — Mejor período de utilidad con un millón de datos
// =====================================================================
// Uso: node utilidad.js   (o desde el menú: node index.js)
//
// P[0..n−1] tiene la utilidad diaria (ganancia − costo) de una empresa.
//
//   Parte A (parteA.js): el mejor período → Kadane Θ(n) vs Divide y Conquista
//            Θ(n log n), con fuerza bruta Θ(n²) sobre una muestra como referencia.
//   Parte B (parteB.js): los 10 mejores períodos que no se solapan → D&C
//            incremental + Max-Heap, contrastado con un óptimo por PD.
//   Parte C (parteC.js): mediana y percentiles → Quickselect (Lomuto y Hoare)
//            vs Merge Sort, validados con búsqueda binaria.

const { cargarDatos } = require('./datos');
const { medir, conPuntos, formatearTiempo } = require('./medicion');
const { parteA } = require('./parteA');
const { parteB } = require('./parteB');
const { parteC } = require('./parteC');

function main() {
  console.log('Cargando datos…');
  const { resultado: P, ms } = medir(() => cargarDatos());
  mostrarResumenDeLosDatos(P, ms);

  parteA(P);
  parteB(P);
  parteC(P);
}

function mostrarResumenDeLosDatos(P, msDeCarga) {
  let utilidadTotal = 0;
  let diasConGanancia = 0;
  let minimo = Infinity;
  let maximo = -Infinity;

  for (const utilidad of P) {
    utilidadTotal += utilidad;
    if (utilidad > 0) diasConGanancia++;
    if (utilidad < minimo) minimo = utilidad;
    if (utilidad > maximo) maximo = utilidad;
  }

  const porcentajeConGanancia = ((diasConGanancia / P.length) * 100).toFixed(1);
  console.log(`n = ${conPuntos(P.length)} valores (rango ${minimo} a ${maximo}) leídos en ${formatearTiempo(msDeCarga)}`);
  console.log(`Utilidad total: ${conPuntos(utilidadTotal)}   días con ganancia: ${conPuntos(diasConGanancia)} (${porcentajeConGanancia} %)`);
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio4/utilidad.js
if (require.main === module) main();
