// =====================================================================
// Ejercicio 4 — PARTE C: mediana y percentiles de la utilidad diaria
// =====================================================================
//
// 1. Mediana, P50, P90 y P95 con Quickselect (Lomuto y Hoare) y con Merge Sort.
// 2. Validación sobre el arreglo ordenado, con búsqueda binaria.
// 3. Reporte de tiempo, comparaciones, swaps y memoria; entradas adversas y
//    discusión.

const {
  medir, generadorAleatorio, conPuntos, formatearTiempo, formatearBytes,
  imprimirTabla, titulo, subtitulo,
} = require('./medicion');
const {
  nuevoContador, pivoteAleatorio, pivoteFijo, quickselectLomuto, quickselectHoare,
  mergeSort, cantidadMenores, cantidadMenoresOIguales, posicionDelPercentil,
} = require('./cuantiles');

const SEMILLA_PIVOTES = 2026;
const TAMANIO_ADVERSO = 10000; // tamaño de los experimentos con entradas adversas
const PERCENTILES = [50, 90, 95];

function parteC(P) {
  const n = P.length;
  titulo('PARTE C — Mediana y percentiles de la utilidad diaria');

  // Posiciones (contando desde 0) que se buscan en el arreglo ordenado
  const posiciones = {
    medianaInferior: n / 2 - 1,
    medianaSuperior: n / 2,
    percentiles: PERCENTILES.map((p) => ({ nombre: `p${p}`, posicion: posicionDelPercentil(p, n) })),
  };
  explicarConvenciones(n, posiciones);

  const conMergeSort = ordenarConMergeSort(P, posiciones);
  const conLomuto = calcularConQuickselect(P, quickselectLomuto, posiciones);
  const conHoare = calcularConQuickselect(P, quickselectHoare, posiciones);

  mostrarCuantiles(posiciones, conLomuto, conHoare, conMergeSort);
  validarConBusquedaBinaria(n, posiciones, conLomuto, conHoare, conMergeSort);
  mostrarRendimiento(n, conLomuto, conHoare, conMergeSort);
  probarEntradasAdversas(P);
  discutir(conLomuto, conHoare, conMergeSort);
}

function explicarConvenciones(n, { medianaInferior, medianaSuperior }) {
  console.log('  Convenciones:');
  console.log(`   - Percentil p (rango más cercano): k = ⌈p·n/100⌉ − 1 (posición 0-based en el arreglo ordenado).`);
  console.log(`   - Mediana con n par (n = ${conPuntos(n)}): promedio de los dos centrales, posiciones ${conPuntos(medianaInferior)} y ${conPuntos(medianaSuperior)}.`);
  console.log('     Con Quickselect se selecciona la posición n/2−1; después, como todo lo de la derecha');
  console.log('     es ≥, el central superior es el mínimo de a[n/2..n−1] (n/2 comparaciones más).');
  console.log('   - Cada cuantil se calcula con Quickselect sobre una copia nueva del arreglo.');
}

// ---------------------------------------------------------------------
// Cálculo de los cuantiles
// ---------------------------------------------------------------------

// Referencia: ordenar todo una vez y leer cada posición.
function ordenarConMergeSort(P, { medianaInferior, medianaSuperior, percentiles }) {
  const contador = nuevoContador();
  const { resultado: ordenado, ms } = medir(() => mergeSort(Int32Array.from(P), contador), 1);

  const valores = {
    medianaInferior: ordenado[medianaInferior],
    medianaSuperior: ordenado[medianaSuperior],
    mediana: (ordenado[medianaInferior] + ordenado[medianaSuperior]) / 2,
  };
  for (const { nombre, posicion } of percentiles) {
    valores[nombre] = ordenado[posicion];
  }

  return { ordenado, valores, ms, contador };
}

// Calcula la mediana y cada percentil con Quickselect, cada uno sobre una copia
// nueva del arreglo. Devuelve los valores, el tiempo total, los totales de
// operaciones y el detalle por cuantil.
function calcularConQuickselect(P, quickselect, { medianaInferior, medianaSuperior, percentiles }) {
  const elegirPivote = pivoteAleatorio(generadorAleatorio(SEMILLA_PIVOTES));
  const valores = {};
  const detalle = [];

  // Mediana: se selecciona la posición n/2 − 1 y el central superior es el
  // mínimo de la mitad derecha (que ya quedó toda ≥).
  {
    const arreglo = Int32Array.from(P);
    const contador = nuevoContador();
    const { resultado, ms } = medir(() => {
      const inferior = quickselect(arreglo, medianaInferior, elegirPivote, contador);
      const superior = minimoDesde(arreglo, medianaSuperior, contador);
      return { inferior, superior };
    });
    valores.medianaInferior = resultado.inferior;
    valores.medianaSuperior = resultado.superior;
    valores.mediana = (resultado.inferior + resultado.superior) / 2;
    detalle.push({ nombre: 'mediana', ms, ...contador });
  }

  for (const { nombre, posicion } of percentiles) {
    const arreglo = Int32Array.from(P);
    const contador = nuevoContador();
    const { resultado, ms } = medir(() => quickselect(arreglo, posicion, elegirPivote, contador));
    valores[nombre] = resultado;
    detalle.push({ nombre, ms, ...contador });
  }

  const sumar = (campo) => detalle.reduce((suma, d) => suma + d[campo], 0);
  return {
    valores,
    detalle,
    ms: sumar('ms'),
    totales: { comparaciones: sumar('comparaciones'), swaps: sumar('swaps'), particiones: sumar('particiones') },
  };
}

function minimoDesde(arreglo, desde, contador) {
  let minimo = Infinity;
  for (let i = desde; i < arreglo.length; i++) {
    contador.comparaciones++;
    if (arreglo[i] < minimo) minimo = arreglo[i];
  }
  return minimo;
}

// ---------------------------------------------------------------------
// 1. Resultados
// ---------------------------------------------------------------------

function mostrarCuantiles({ medianaInferior, medianaSuperior, percentiles }, conLomuto, conHoare, conMergeSort) {
  subtitulo('1. Mediana y percentiles');

  const filas = [[
    'Mediana',
    `(${conPuntos(medianaInferior)} + ${conPuntos(medianaSuperior)}) / 2`,
    conLomuto.valores.mediana,
    conHoare.valores.mediana,
    conMergeSort.valores.mediana,
  ]];
  for (const { nombre, posicion } of percentiles) {
    filas.push([
      nombre.toUpperCase(),
      conPuntos(posicion),
      conLomuto.valores[nombre],
      conHoare.valores[nombre],
      conMergeSort.valores[nombre],
    ]);
  }
  imprimirTabla(['Cuantil', 'Posición (0-based)', 'Quickselect Lomuto', 'Quickselect Hoare', 'Merge Sort'], filas);

  const v = conMergeSort.valores;
  console.log(`\n  Centrales: a[${conPuntos(medianaInferior)}] = ${v.medianaInferior}, a[${conPuntos(medianaSuperior)}] = ${v.medianaSuperior} → mediana = ${v.mediana}`);
}

// ---------------------------------------------------------------------
// 2. Validación
// ---------------------------------------------------------------------

function validarConBusquedaBinaria(n, posiciones, conLomuto, conHoare, conMergeSort) {
  const { ordenado } = conMergeSort;

  subtitulo('2. Validación sobre el arreglo ordenado (búsqueda binaria)');
  console.log(`  Arreglo de Merge Sort ordenado: ${estaOrdenado(ordenado) ? 'sí' : 'NO'}`);
  console.log('  Criterio: v está en la posición k ⇔ #(< v) ≤ k < #(≤ v)  (#: contado con búsqueda binaria)\n');

  // Se validan los valores que dio Hoare
  const aValidar = [
    { nombre: 'Mediana (inf.)', posicion: posiciones.medianaInferior, valor: conHoare.valores.medianaInferior },
    { nombre: 'Mediana (sup.)', posicion: posiciones.medianaSuperior, valor: conHoare.valores.medianaSuperior },
    ...posiciones.percentiles.map(({ nombre, posicion }) => ({
      nombre: nombre.toUpperCase(), posicion, valor: conHoare.valores[nombre],
    })),
  ];

  const filas = aValidar.map(({ nombre, posicion, valor }) => {
    const contador = { comparaciones: 0 };
    const menores = cantidadMenores(ordenado, valor, contador);
    const menoresOIguales = cantidadMenoresOIguales(ordenado, valor, contador);
    const esCorrecto = menores <= posicion && posicion < menoresOIguales && valor === ordenado[posicion];
    const porcentaje = `${((menoresOIguales / n) * 100).toFixed(2)} %`;
    return [nombre, valor, conPuntos(posicion), conPuntos(menores), conPuntos(menoresOIguales), porcentaje, contador.comparaciones, esCorrecto ? '✔' : '✘'];
  });
  imprimirTabla(['Cuantil', 'Valor', 'k', '#(< v)', '#(≤ v)', '% ≤ v', 'Comp. bin.', 'OK'], filas);

  const cuantiles = ['mediana', ...posiciones.percentiles.map((p) => p.nombre)];
  const coinciden = cuantiles.every((q) => (
    conLomuto.valores[q] === conMergeSort.valores[q] && conHoare.valores[q] === conMergeSort.valores[q]
  ));
  const valoresDistintos = new Set(ordenado).size;

  console.log(`\n  Lomuto, Hoare y Merge Sort coinciden en todos los cuantiles: ${coinciden ? 'sí' : 'NO'}`);
  console.log(`  Valores distintos en los datos: ${valoresDistintos} (de −100 a 100) → cada valor se repite ≈ ${conPuntos(n / valoresDistintos)} veces.`);
}

function estaOrdenado(arreglo) {
  for (let i = 1; i < arreglo.length; i++) {
    if (arreglo[i - 1] > arreglo[i]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------
// 3. Reporte de rendimiento
// ---------------------------------------------------------------------

function mostrarRendimiento(n, conLomuto, conHoare, conMergeSort) {
  subtitulo('3. Reporte de rendimiento (n = 1.000.000; mediana + p50 + p90 + p95)');
  imprimirTabla(
    ['Enfoque', 'Tiempo', 'Comparaciones', 'Swaps / movim.', 'Particiones', 'Memoria adicional'],
    [
      filaQuickselect('Quickselect Lomuto', conLomuto),
      filaQuickselect('Quickselect Hoare', conHoare),
      [
        'Merge Sort (1 vez)',
        formatearTiempo(conMergeSort.ms),
        conPuntos(conMergeSort.contador.comparaciones),
        conPuntos(conMergeSort.contador.movimientos) + ' movim.',
        '—',
        `Θ(n) — ${formatearBytes(conMergeSort.contador.memoriaExtra)} (buffer)`,
      ],
    ]
  );

  console.log('\n  Detalle por cuantil (Quickselect):');
  const filas = conLomuto.detalle.map((lomuto, i) => {
    const hoare = conHoare.detalle[i];
    return [
      lomuto.nombre,
      formatearTiempo(lomuto.ms), conPuntos(lomuto.comparaciones), conPuntos(lomuto.swaps), lomuto.particiones,
      formatearTiempo(hoare.ms), conPuntos(hoare.comparaciones), conPuntos(hoare.swaps), hoare.particiones,
    ];
  });
  imprimirTabla(['Cuantil', 'Lomuto: tiempo', 'comparaciones', 'swaps', 'part.', 'Hoare: tiempo', 'comparaciones', 'swaps', 'part.'], filas);

  console.log(`\n  Referencia teórica: Quickselect promedio ≈ 2n–3,4n comparaciones (${conPuntos(2 * n)}–${conPuntos(3.4 * n)}) por cuantil;`);
  console.log(`  Merge Sort ≈ n·log₂n − n = ${conPuntos(n * Math.log2(n) - n)} comparaciones. Copiar la entrada (${formatearBytes(n * 4)}) no se cuenta como memoria del algoritmo.`);
}

function filaQuickselect(nombre, { ms, totales }) {
  return [
    nombre,
    formatearTiempo(ms),
    conPuntos(totales.comparaciones),
    conPuntos(totales.swaps) + ' swaps',
    conPuntos(totales.particiones),
    'O(1) — in-place',
  ];
}

// ---------------------------------------------------------------------
// Entradas adversas y repetidos
// ---------------------------------------------------------------------

function probarEntradasAdversas(P) {
  const n = TAMANIO_ADVERSO;
  const posicionMediana = n / 2;

  subtitulo(`Entradas adversas y repetidos (n = ${conPuntos(n)}, buscando la mediana)`);

  const entradas = [
    { nombre: 'Datos reales (muestra)', datos: Int32Array.from(P.subarray(0, n)) },
    { nombre: 'Ya ordenado', datos: Int32Array.from({ length: n }, (_, i) => i) },
    { nombre: 'Todos iguales', datos: new Int32Array(n) },
  ];

  // Cuántas comparaciones hace un Quickselect con una forma de elegir el pivote
  const comparacionesDe = (quickselect, elegirPivote, datos) => {
    const contador = nuevoContador();
    quickselect(Int32Array.from(datos), posicionMediana, elegirPivote, contador);
    return conPuntos(contador.comparaciones);
  };

  const filas = entradas.map(({ nombre, datos }) => [
    nombre,
    comparacionesDe(quickselectLomuto, pivoteFijo, datos),
    comparacionesDe(quickselectLomuto, pivoteAleatorio(generadorAleatorio(7)), datos),
    comparacionesDe(quickselectHoare, pivoteFijo, datos),
    comparacionesDe(quickselectHoare, pivoteAleatorio(generadorAleatorio(7)), datos),
  ]);
  imprimirTabla(['Entrada', 'Lomuto pivote fijo', 'Lomuto aleatorio', 'Hoare pivote fijo', 'Hoare aleatorio'], filas);

  console.log(`\n  Referencias: lineal ≈ 2n–4n = ${conPuntos(2 * n)}–${conPuntos(4 * n)}   ·   cuadrático ≈ n²/8–n²/2 = ${conPuntos(n ** 2 / 8)}–${conPuntos(n ** 2 / 2)}`);
  console.log('  (pivote fijo: último elemento en Lomuto, primero en Hoare)');
}

// ---------------------------------------------------------------------
// Discusión
// ---------------------------------------------------------------------

function discutir(conLomuto, conHoare, conMergeSort) {
  const cantidadDeCuantiles = conLomuto.detalle.length;
  const porCuantil = (enfoque) => enfoque.totales.comparaciones / cantidadDeCuantiles;

  subtitulo('Discusión');
  const lineas = [
    `• Resultado medido: por cuantil, Hoare hizo ≈ ${conPuntos(porCuantil(conHoare))} comparaciones, Lomuto ≈ ${conPuntos(porCuantil(conLomuto))}`,
    `  y Merge Sort ${conPuntos(conMergeSort.contador.comparaciones)} para ordenar todo. Hoare queda cerca de la cota O(n); Lomuto se`,
    `  aleja por los repetidos, al punto de que sus ${cantidadDeCuantiles} selecciones (${conPuntos(conLomuto.totales.comparaciones)}) superan a un solo Merge Sort.`,
    '• ¿Por qué Quickselect y no ordenar todo? Para UN cuantil, Quickselect descarta en cada paso',
    '  la parte que no contiene la posición k: en promedio n + n/2 + n/4 + … ≈ 2n → O(n), in-place.',
    '  Ordenar cuesta Θ(n log n) y Merge Sort además necesita un buffer de n elementos. Ordenar solo',
    '  conviene si se van a pedir MUCHOS cuantiles (se ordena una vez y cada consulta es O(1)).',
    '• Entradas adversas: con pivote fijo, un arreglo ya ordenado hace que cada partición descarte',
    '  un solo elemento → O(n²). El pivote aleatorio (o mediana de tres) lo evita en la práctica;',
    '  la garantía O(n) en el peor caso la da la "mediana de medianas" (BFPRT).',
    '• Repetidos: es el caso de estos datos (201 valores distintos en un millón). Lomuto manda los',
    '  iguales al pivote a un solo lado; cuando el subarreglo queda con un bloque de valores iguales',
    '  avanza de a un elemento → degeneración cuadrática local: miles de particiones y varias veces',
    '  más comparaciones que Hoare. Hoare se detiene también en los iguales y los reparte entre ambos',
    '  lados, así que parte por la mitad incluso si todos son iguales. Con muchos repetidos conviene',
    '  Hoare o una partición en tres vías (<, =, > pivote), que termina apenas k cae en el bloque "=".',
  ];
  for (const linea of lineas) {
    console.log('  ' + linea);
  }
}

module.exports = { parteC };
