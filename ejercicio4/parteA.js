// =====================================================================
// Ejercicio 4 — PARTE A: el mejor período (sub-arreglo de suma máxima)
// =====================================================================
//
// 1. Mediciones: Kadane Θ(n) frente a Divide y Conquista Θ(n log n), más fuerza
//    bruta Θ(n²) sobre una muestra (extrapolada a un millón) como referencia.
// 2. Salida: utilidad máxima, días de inicio y fin, y un gráfico ASCII.

const { medir, conPuntos, formatearTiempo, imprimirTabla, titulo, subtitulo } = require('./medicion');
const { kadane, divideYConquista, fuerzaBruta, sumaDelRango } = require('./subarreglo');
const { utilidadAcumulada, dibujarCurva } = require('./grafico');

const TAMANIO_MUESTRA_FUERZA_BRUTA = 10000;

function parteA(P) {
  titulo('PARTE A — Sub-arreglo máximo (mejor período)');

  const mediciones = medirLosTresAlgoritmos(P);
  mostrarMediciones(P.length, mediciones);
  mostrarMejorPeriodo(P, mediciones);
  graficarMejorPeriodo(P, mediciones.kadane.resultado);

  return mediciones.kadane.resultado;
}

// ---------------------------------------------------------------------

function medirLosTresAlgoritmos(P) {
  // Kadane (5 corridas: es tan rápido que una sola sería poco confiable)
  let contadorKadane;
  const medicionKadane = medir(() => {
    contadorKadane = { comparaciones: 0 };
    return kadane(P, 0, P.length - 1, contadorKadane);
  }, 5);

  // Divide y Conquista (3 corridas)
  let contadorDyC;
  const medicionDyC = medir(() => {
    contadorDyC = { comparaciones: 0, llamadas: 0 };
    return divideYConquista(P, contadorDyC);
  }, 3);

  // Fuerza bruta: solo sobre una muestra, porque con un millón tardaría minutos
  const muestra = P.subarray(0, TAMANIO_MUESTRA_FUERZA_BRUTA);
  let contadorFuerzaBruta;
  const medicionFuerzaBruta = medir(() => {
    contadorFuerzaBruta = { comparaciones: 0 };
    return fuerzaBruta(muestra, contadorFuerzaBruta);
  }, 1);
  const kadaneEnLaMuestra = kadane(muestra);

  return {
    kadane: { ...medicionKadane, contador: contadorKadane },
    divideYConquista: { ...medicionDyC, contador: contadorDyC },
    fuerzaBruta: { ...medicionFuerzaBruta, contador: contadorFuerzaBruta, kadaneEnLaMuestra },
  };
}

function mostrarMediciones(n, { kadane, divideYConquista, fuerzaBruta }) {
  const log2n = Math.log2(n);
  const m = TAMANIO_MUESTRA_FUERZA_BRUTA;
  const paresEnLaMuestra = (m * (m + 1)) / 2;
  const factorDeExtrapolacion = (n / m) ** 2; // Θ(n²): n veces más datos → n² veces más trabajo

  subtitulo(`1. Mediciones (n = ${conPuntos(n)})`);
  imprimirTabla(
    ['Algoritmo', 'Complejidad', 'Tiempo', 'Comparaciones', 'Cota teórica', 'Medido / cota'],
    [
      [
        'Kadane (PD)', 'Θ(n)',
        formatearTiempo(kadane.ms),
        conPuntos(kadane.contador.comparaciones),
        `2n = ${conPuntos(2 * n)}`,
        (kadane.contador.comparaciones / (2 * n)).toFixed(3),
      ],
      [
        'Divide y Conquista', 'Θ(n log n)',
        formatearTiempo(divideYConquista.ms),
        conPuntos(divideYConquista.contador.comparaciones),
        `n·log₂n ≈ ${conPuntos(n * log2n)}`,
        (divideYConquista.contador.comparaciones / (n * log2n)).toFixed(3),
      ],
      [
        `Fuerza bruta (n=${conPuntos(m)})`, 'Θ(n²)',
        formatearTiempo(fuerzaBruta.ms),
        conPuntos(fuerzaBruta.contador.comparaciones),
        `n(n+1)/2 = ${conPuntos(paresEnLaMuestra)}`,
        (fuerzaBruta.contador.comparaciones / paresEnLaMuestra).toFixed(3),
      ],
      [
        'Fuerza bruta (n=1e6, extrap.)', 'Θ(n²)',
        `≈ ${formatearTiempo(fuerzaBruta.ms * factorDeExtrapolacion)}`,
        `≈ ${conPuntos(fuerzaBruta.contador.comparaciones * factorDeExtrapolacion)}`,
        `n(n+1)/2 ≈ ${conPuntos((n * (n + 1)) / 2)}`,
        '—',
      ],
    ]
  );

  const vecesMasComparaciones = divideYConquista.contador.comparaciones / kadane.contador.comparaciones;
  const vecesMasTiempo = divideYConquista.ms / kadane.ms;
  const resultadoMuestra = fuerzaBruta.resultado;
  const coincideConKadane = fuerzaBruta.kadaneEnLaMuestra.suma === resultadoMuestra.suma;

  console.log(`\n  Tiempos: mediana de varias corridas. Llamadas recursivas de D&C: ${conPuntos(divideYConquista.contador.llamadas)} (= 2n − 1).`);
  console.log(`  D&C / Kadane: ${vecesMasComparaciones.toFixed(1)}× comparaciones y ${vecesMasTiempo.toFixed(1)}× tiempo`);
  console.log(`  (la teoría predice ≈ log₂n / 2 = ${(log2n / 2).toFixed(1)}×; el tiempo crece más por el costo de la recursión).`);
  console.log(`  Fuerza bruta en la muestra: suma ${conPuntos(resultadoMuestra.suma)} en [${resultadoMuestra.inicio}, ${resultadoMuestra.fin}] — Kadane da lo mismo: ${coincideConKadane ? 'sí' : 'NO'}`);
  console.log(`  Extrapolar Θ(n²) a un millón: ×${conPuntos(factorDeExtrapolacion)} → inviable frente a los ms de Kadane.`);
}

function mostrarMejorPeriodo(P, mediciones) {
  const mejor = mediciones.kadane.resultado;
  const segunDyC = mediciones.divideYConquista.resultado;
  const dias = mejor.fin - mejor.inicio + 1;

  const mismoRango = segunDyC.suma === mejor.suma && segunDyC.inicio === mejor.inicio && segunDyC.fin === mejor.fin;
  const comparacionDyC = mismoRango ? 'mismo resultado' : 'misma suma, otro rango óptimo';

  subtitulo('2. Salida');
  console.log(`  Valor máximo de utilidad: ${conPuntos(mejor.suma)}`);
  console.log(`  Mejor período: días ${conPuntos(mejor.inicio)} a ${conPuntos(mejor.fin)} (inclusive) → ${conPuntos(dias)} días`);
  console.log(`  Verificación (suma directa del rango): ${conPuntos(sumaDelRango(P, mejor.inicio, mejor.fin))}`);
  console.log(`  Divide y Conquista: ${conPuntos(segunDyC.suma)} en [${conPuntos(segunDyC.inicio)}, ${conPuntos(segunDyC.fin)}] → ${comparacionDyC}`);
}

// Dos gráficos: el arreglo completo y un zoom con un margen del 25 % del
// período a cada lado.
function graficarMejorPeriodo(P, mejor) {
  const acumulada = utilidadAcumulada(P);

  console.log();
  dibujarCurva(acumulada, {
    inicioDestacado: mejor.inicio,
    finDestacado: mejor.fin,
    ancho: 100,
    alto: 16,
    titulo: '  Utilidad acumulada S(i) = P[0]+…+P[i] — muestreada en 100 columnas (█ = mejor período: la mayor subida)',
  });

  const margen = Math.round((mejor.fin - mejor.inicio) * 0.25);
  const desde = Math.max(0, mejor.inicio - margen);
  const hasta = Math.min(P.length - 1, mejor.fin + margen);

  console.log();
  dibujarCurva(acumulada, {
    desde,
    hasta,
    inicioDestacado: mejor.inicio,
    finDestacado: mejor.fin,
    ancho: 100,
    alto: 12,
    titulo: `  Zoom sobre el mejor período (días ${conPuntos(desde)} a ${conPuntos(hasta)})`,
  });
}

module.exports = { parteA };
