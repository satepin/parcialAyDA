// =====================================================================
// Ejercicio 4 — PARTE B: los 10 mejores períodos que no se solapan
// =====================================================================
//
// Criterio: ranking voraz (ver topk.js). Se informa el resultado, su costo y la
// estructura de datos usada, y se contrasta con el óptimo de la suma total
// calculado con Programación Dinámica.

const { medir, conPuntos, formatearTiempo, imprimirTabla, titulo, subtitulo } = require('./medicion');
const { sumaDelRango } = require('./subarreglo');
const { topKVoraz, sumaOptimaPD } = require('./topk');
const { dibujarFranja } = require('./grafico');

const K = 10;

function parteB(P) {
  titulo(`PARTE B — Top ${K} períodos contiguos no solapados`);
  console.log('  Criterio: ranking voraz. El período t es el mejor sub-arreglo que no se');
  console.log('  solapa con los t−1 ya elegidos (el 1 es el sub-arreglo máximo de la parte A).');
  console.log('  Algoritmo: D&C incremental — cada período elegido parte su segmento en dos;');
  console.log('  a cada mitad se le aplica Kadane y su mejor período entra a un Max-Heap.');

  const medicionVoraz = medir(() => topKVoraz(P, K), 3);
  const { periodos, estadisticas } = medicionVoraz.resultado;
  const medicionPD = medir(() => sumaOptimaPD(P, K), 1);

  const sumaVoraz = mostrarPeriodos(P, periodos);
  mostrarCosto(P.length, medicionVoraz.ms, estadisticas);
  mostrarContrasteConPD(sumaVoraz, medicionPD);
}

// ---------------------------------------------------------------------

function mostrarPeriodos(P, periodos) {
  subtitulo('Resultado');

  const filas = periodos.map((periodo, indice) => {
    const sumaVerificada = sumaDelRango(P, periodo.inicio, periodo.fin);
    return [
      indice + 1,
      conPuntos(periodo.suma),
      conPuntos(periodo.inicio),
      conPuntos(periodo.fin),
      conPuntos(periodo.fin - periodo.inicio + 1),
      sumaVerificada === periodo.suma ? '✔' : '✘',
    ];
  });
  imprimirTabla(['#', 'Utilidad', 'Inicio', 'Fin', 'Días', 'Verificación'], filas);

  const sumaTotal = periodos.reduce((suma, periodo) => suma + periodo.suma, 0);
  const haySolapamiento = algunoSeSolapa(periodos);
  console.log(`\n  Suma de los ${K} períodos: ${conPuntos(sumaTotal)}   ¿Algún solapamiento? ${haySolapamiento ? 'SÍ' : 'no'}`);

  console.log('\n  Ubicación en el arreglo:');
  dibujarFranja(P.length, periodos, 100);

  return sumaTotal;
}

// Ordenados por inicio, dos períodos se solapan si uno empieza antes de que
// termine el anterior.
function algunoSeSolapa(periodos) {
  const porInicio = [...periodos].sort((a, b) => a.inicio - b.inicio);
  for (let i = 1; i < porInicio.length; i++) {
    if (porInicio[i].inicio <= porInicio[i - 1].fin) return true;
  }
  return false;
}

function mostrarCosto(n, ms, estadisticas) {
  const vecesN = (estadisticas.elementosProcesados / n).toFixed(2);

  subtitulo('Costo y estructura de datos');
  imprimirTabla(
    ['Concepto', 'Valor'],
    [
      ['Tiempo total', formatearTiempo(ms)],
      ['Llamadas a Kadane', `${conPuntos(estadisticas.kadaneLlamadas)} (≤ 2k + 1 = ${2 * K + 1})`],
      ['Elementos recorridos por Kadane', `${conPuntos(estadisticas.elementosProcesados)} (${vecesN}·n; peor caso k·n)`],
      ['Comparaciones en Kadane', conPuntos(estadisticas.comparaciones)],
      ['Comparaciones en el heap', `${conPuntos(estadisticas.comparacionesHeap)} → O(k log k), despreciable`],
      ['Tamaño máximo del heap', `${estadisticas.tamanioMaximoDelHeap} segmentos (memoria O(k))`],
    ]
  );
  console.log('\n  Costo: O(k·n) en el peor caso (Kadane sobre los segmentos) + O(k log k) del heap.');
  console.log('  En la práctica cada extracción solo recorre el segmento que se partió, por eso');
  console.log(`  se procesaron ${vecesN}·n elementos en lugar de ${K}·n.`);
}

function mostrarContrasteConPD(sumaVoraz, medicionPD) {
  const sumaOptima = medicionPD.resultado.suma;
  const diferencia = sumaOptima - sumaVoraz;
  const porcentaje = ((diferencia / sumaOptima) * 100).toFixed(1);

  subtitulo('Contraste: óptimo de la SUMA TOTAL con Programación Dinámica O(n·k)');
  console.log(`  PD (máximo de la suma de hasta ${K} períodos disjuntos): ${conPuntos(sumaOptima)}`);
  console.log(`  Voraz (ranking):                                       ${conPuntos(sumaVoraz)}`);
  console.log(`  Diferencia: ${conPuntos(diferencia)} (${porcentaje} %)   Tiempo PD: ${formatearTiempo(medicionPD.ms)} (${conPuntos(medicionPD.resultado.operaciones)} operaciones)`);
  console.log('  El voraz no maximiza la suma total: al tomar primero el tramo más largo, a veces');
  console.log('  "gasta" un lugar del top que dividido en dos tramos buenos rendiría más. Son dos');
  console.log('  criterios distintos; se eligió el ranking porque responde "cuáles fueron los mejores');
  console.log('  períodos" y es incremental (pedir el período 11 cuesta solo una extracción más).');
}

module.exports = { parteB };
