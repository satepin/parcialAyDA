// Ejercicio 4 — Mejor período de utilidad con un millón de datos
// Uso: node utilidad.js   (o desde el menú: node index.js)
//
// Parte A: subarreglo máximo → Kadane O(n) vs Divide y Conquista O(n log n)
//          (+ Fuerza Bruta O(n²) sobre una muestra, como referencia)
// Parte B: top-10 períodos no solapados → D&C incremental + Max-Heap
//          (+ óptimo de suma total por Programación Dinámica, para contrastar)
// Parte C: mediana y percentiles → Quickselect (Lomuto / Hoare) vs Merge Sort,
//          validación con búsqueda binaria y entradas adversas

const { cargarDatos } = require('./datos');
const { medir, fmtMs, fmtN, fmtBytes, rngConSemilla, tabla, titulo, subtitulo } = require('./medicion');
const { kadane, divideYConquista, fuerzaBruta, sumaRango } = require('./subarreglo');
const { topKVoraz, sumaOptimaPD } = require('./topk');
const C = require('./cuantiles');
const { acumulada, curva, franja } = require('./grafico');

const K = 10;
const MUESTRA_FB = 10000; // tamaño de la muestra para fuerza bruta O(n²)
const N_ADVERSO = 10000; //  tamaño para los experimentos de entradas adversas

// =====================================================================
// PARTE A
// =====================================================================
function parteA(P) {
  const n = P.length;
  const log2n = Math.log2(n);
  titulo('PARTE A — Sub-arreglo máximo (mejor período)');

  // Kadane
  let cK;
  const mK = medir(() => kadane(P, 0, n - 1, (cK = { comparaciones: 0 })), 5);
  // Divide y Conquista
  let cD;
  const mD = medir(() => divideYConquista(P, (cD = { comparaciones: 0, llamadas: 0 })), 3);
  // Fuerza bruta sobre una muestra
  const muestra = P.subarray(0, MUESTRA_FB);
  let cF;
  const mF = medir(() => fuerzaBruta(muestra, (cF = { comparaciones: 0 })), 1);
  const kMuestra = kadane(muestra);
  const factor = (n / MUESTRA_FB) ** 2;

  subtitulo(`1. Mediciones (n = ${fmtN(n)})`);
  tabla(
    ['Algoritmo', 'Complejidad', 'Tiempo', 'Comparaciones', 'Cota teórica', 'Medido / cota'],
    [
      ['Kadane (PD)', 'Θ(n)', fmtMs(mK.ms), fmtN(cK.comparaciones), `2n = ${fmtN(2 * n)}`, (cK.comparaciones / (2 * n)).toFixed(3)],
      ['Divide y Conquista', 'Θ(n log n)', fmtMs(mD.ms), fmtN(cD.comparaciones), `n·log₂n ≈ ${fmtN(n * log2n)}`, (cD.comparaciones / (n * log2n)).toFixed(3)],
      [`Fuerza bruta (n=${fmtN(MUESTRA_FB)})`, 'Θ(n²)', fmtMs(mF.ms), fmtN(cF.comparaciones), `n(n+1)/2 = ${fmtN((MUESTRA_FB * (MUESTRA_FB + 1)) / 2)}`, (cF.comparaciones / ((MUESTRA_FB * (MUESTRA_FB + 1)) / 2)).toFixed(3)],
      ['Fuerza bruta (n=1e6, extrap.)', 'Θ(n²)', `≈ ${fmtMs(mF.ms * factor)}`, `≈ ${fmtN(cF.comparaciones * factor)}`, `n(n+1)/2 ≈ ${fmtN((n * (n + 1)) / 2)}`, '—'],
    ]
  );
  console.log(`\n  Tiempos: mediana de varias corridas. Llamadas recursivas de D&C: ${fmtN(cD.llamadas)} (= 2n − 1).`);
  console.log(`  D&C / Kadane: ${(cD.comparaciones / cK.comparaciones).toFixed(1)}× comparaciones y ${(mD.ms / mK.ms).toFixed(1)}× tiempo`);
  console.log(`  (la teoría predice ≈ log₂n / 2 = ${(log2n / 2).toFixed(1)}×; el tiempo crece más por el costo de la recursión).`);
  console.log(`  Fuerza bruta en la muestra: suma ${fmtN(mF.resultado.suma)} en [${mF.resultado.inicio}, ${mF.resultado.fin}] — Kadane da lo mismo: ${kMuestra.suma === mF.resultado.suma ? 'sí' : 'NO'}`);
  console.log(`  Extrapolar Θ(n²) a un millón: ×${fmtN(factor)} → inviable frente a los ms de Kadane.`);

  const r = mK.resultado;
  const rD = mD.resultado;
  subtitulo('2. Salida');
  console.log(`  Valor máximo de utilidad: ${fmtN(r.suma)}`);
  console.log(`  Mejor período: días ${fmtN(r.inicio)} a ${fmtN(r.fin)} (inclusive) → ${fmtN(r.fin - r.inicio + 1)} días`);
  console.log(`  Verificación (suma directa del rango): ${fmtN(sumaRango(P, r.inicio, r.fin))}`);
  console.log(`  Divide y Conquista: ${fmtN(rD.suma)} en [${fmtN(rD.inicio)}, ${fmtN(rD.fin)}] → ${rD.suma === r.suma && rD.inicio === r.inicio && rD.fin === r.fin ? 'mismo resultado' : 'misma suma, otro rango óptimo'}`);

  const S = acumulada(P);
  console.log();
  curva(S, {
    resIni: r.inicio, resFin: r.fin, ancho: 100, alto: 16,
    titulo: '  Utilidad acumulada S(i) = P[0]+…+P[i] — muestreada en 100 columnas (█ = mejor período: la mayor subida)',
  });
  const margen = Math.round((r.fin - r.inicio) * 0.25);
  const desde = Math.max(0, r.inicio - margen);
  const hasta = Math.min(n - 1, r.fin + margen);
  console.log();
  curva(S, {
    desde, hasta, resIni: r.inicio, resFin: r.fin, ancho: 100, alto: 12,
    titulo: `  Zoom sobre el mejor período (días ${fmtN(desde)} a ${fmtN(hasta)})`,
  });
  return r;
}

// =====================================================================
// PARTE B
// =====================================================================
function parteB(P) {
  const n = P.length;
  titulo(`PARTE B — Top ${K} períodos contiguos no solapados`);
  console.log('  Criterio: ranking voraz. El período t es el mejor sub-arreglo que no se');
  console.log('  solapa con los t−1 ya elegidos (el 1 es el sub-arreglo máximo de la parte A).');
  console.log('  Algoritmo: D&C incremental — cada período elegido parte su segmento en dos;');
  console.log('  a cada mitad se le aplica Kadane y su mejor período entra a un Max-Heap.');

  const mV = medir(() => topKVoraz(P, K), 3);
  const { periodos, cont } = mV.resultado;
  const mPD = medir(() => sumaOptimaPD(P, K), 1);

  subtitulo('Resultado');
  let total = 0;
  tabla(
    ['#', 'Utilidad', 'Inicio', 'Fin', 'Días', 'Verificación'],
    periodos.map((p, i) => {
      total += p.suma;
      return [i + 1, fmtN(p.suma), fmtN(p.inicio), fmtN(p.fin), fmtN(p.fin - p.inicio + 1), sumaRango(P, p.inicio, p.fin) === p.suma ? '✔' : '✘'];
    })
  );
  const ord = [...periodos].sort((a, b) => a.inicio - b.inicio);
  const solapan = ord.some((p, i) => i > 0 && p.inicio <= ord[i - 1].fin);
  console.log(`\n  Suma de los ${K} períodos: ${fmtN(total)}   ¿Algún solapamiento? ${solapan ? 'SÍ' : 'no'}`);
  console.log('\n  Ubicación en el arreglo:');
  franja(n, periodos, 100);

  subtitulo('Costo y estructura de datos');
  tabla(
    ['Concepto', 'Valor'],
    [
      ['Tiempo total', fmtMs(mV.ms)],
      ['Llamadas a Kadane', fmtN(cont.kadaneLlamadas) + ` (≤ 2k + 1 = ${2 * K + 1})`],
      ['Elementos recorridos por Kadane', `${fmtN(cont.elementosProcesados)} (${(cont.elementosProcesados / n).toFixed(2)}·n; peor caso k·n)`],
      ['Comparaciones en Kadane', fmtN(cont.comparaciones)],
      ['Comparaciones en el heap', fmtN(cont.comparacionesHeap) + ' → O(k log k), despreciable'],
      ['Tamaño máximo del heap', `${cont.maxHeap} segmentos (memoria O(k))`],
    ]
  );
  console.log('\n  Costo: O(k·n) en el peor caso (Kadane sobre los segmentos) + O(k log k) del heap.');
  console.log('  En la práctica cada extracción solo recorre el segmento que se partió, por eso');
  console.log(`  se procesaron ${(cont.elementosProcesados / n).toFixed(2)}·n elementos en lugar de ${K}·n.`);

  subtitulo('Contraste: óptimo de la SUMA TOTAL con Programación Dinámica O(n·k)');
  console.log(`  PD (máximo de la suma de hasta ${K} períodos disjuntos): ${fmtN(mPD.resultado.suma)}`);
  console.log(`  Voraz (ranking):                                       ${fmtN(total)}`);
  console.log(`  Diferencia: ${fmtN(mPD.resultado.suma - total)} (${(((mPD.resultado.suma - total) / mPD.resultado.suma) * 100).toFixed(1)} %)   Tiempo PD: ${fmtMs(mPD.ms)} (${fmtN(mPD.resultado.operaciones)} operaciones)`);
  console.log('  El voraz no maximiza la suma total: al tomar primero el tramo más largo, a veces');
  console.log('  "gasta" un lugar del top que dividido en dos tramos buenos rendiría más. Son dos');
  console.log('  criterios distintos; se eligió el ranking porque responde "cuáles fueron los mejores');
  console.log('  períodos" y es incremental (pedir el período 11 cuesta solo una extracción más).');
}

// =====================================================================
// PARTE C
// =====================================================================
function parteC(P) {
  const n = P.length;
  titulo('PARTE C — Mediana y percentiles de la utilidad diaria');
  const kMedInf = n / 2 - 1;
  const kMedSup = n / 2;
  const objetivos = [
    { nombre: 'p50', k: C.indicePercentil(50, n) },
    { nombre: 'p90', k: C.indicePercentil(90, n) },
    { nombre: 'p95', k: C.indicePercentil(95, n) },
  ];
  console.log('  Convenciones:');
  console.log(`   - Percentil p (rango más cercano): k = ⌈p·n/100⌉ − 1 (posición 0-based en el arreglo ordenado).`);
  console.log(`   - Mediana con n par (n = ${fmtN(n)}): promedio de los dos centrales, posiciones ${fmtN(kMedInf)} y ${fmtN(kMedSup)}.`);
  console.log('     Con Quickselect se selecciona la posición n/2−1; después, como todo lo de la derecha');
  console.log('     es ≥, el central superior es el mínimo de a[n/2..n−1] (n/2 comparaciones más).');
  console.log('   - Cada cuantil se calcula con Quickselect sobre una copia nueva del arreglo.');

  // ----- Merge Sort (baseline) -----
  let cM;
  const mM = medir(() => C.mergeSort(Int32Array.from(P), (cM = C.nuevoContador())), 1);
  const ord = mM.resultado;
  const desdeOrdenado = {
    mediana: (ord[kMedInf] + ord[kMedSup]) / 2, medInf: ord[kMedInf], medSup: ord[kMedSup],
    ...Object.fromEntries(objetivos.map((o) => [o.nombre, ord[o.k]])),
  };

  // ----- Quickselect (Lomuto y Hoare) -----
  function conQuickselect(select) {
    const rng = rngConSemilla(2026);
    const piv = C.pivoteAleatorio(rng);
    const tot = C.nuevoContador();
    const sumar = (c) => { tot.comparaciones += c.comparaciones; tot.swaps += c.swaps; tot.particiones += c.particiones; };
    const res = {};
    let ms = 0;

    // Mediana: posición n/2−1 + mínimo de la mitad derecha
    {
      const a = Int32Array.from(P);
      const c = C.nuevoContador();
      const m = medir(() => {
        const inf = select(a, kMedInf, piv, c);
        let sup = Infinity;
        for (let i = kMedSup; i < n; i++) { c.comparaciones++; if (a[i] < sup) sup = a[i]; }
        return { inf, sup };
      });
      ms += m.ms; sumar(c);
      res.medInf = m.resultado.inf; res.medSup = m.resultado.sup;
      res.mediana = (res.medInf + res.medSup) / 2;
      res.detalle = [{ nombre: 'mediana', ms: m.ms, ...c }];
    }
    for (const o of objetivos) {
      const a = Int32Array.from(P);
      const c = C.nuevoContador();
      const m = medir(() => select(a, o.k, piv, c));
      ms += m.ms; sumar(c);
      res[o.nombre] = m.resultado;
      res.detalle.push({ nombre: o.nombre, ms: m.ms, ...c });
    }
    return { res, ms, tot };
  }
  const L = conQuickselect(C.quickselectLomuto);
  const H = conQuickselect(C.quickselectHoare);

  subtitulo('1. Mediana y percentiles');
  tabla(
    ['Cuantil', 'Posición (0-based)', 'Quickselect Lomuto', 'Quickselect Hoare', 'Merge Sort'],
    [
      ['Mediana', `(${fmtN(kMedInf)} + ${fmtN(kMedSup)}) / 2`, L.res.mediana, H.res.mediana, desdeOrdenado.mediana],
      ...objetivos.map((o) => [o.nombre.toUpperCase(), fmtN(o.k), L.res[o.nombre], H.res[o.nombre], desdeOrdenado[o.nombre]]),
    ]
  );
  console.log(`\n  Centrales: a[${fmtN(kMedInf)}] = ${desdeOrdenado.medInf}, a[${fmtN(kMedSup)}] = ${desdeOrdenado.medSup} → mediana = ${desdeOrdenado.mediana}`);

  // ----- Validación -----
  subtitulo('2. Validación sobre el arreglo ordenado (búsqueda binaria)');
  const okOrden = ord.every((v, i) => i === 0 || ord[i - 1] <= v);
  console.log(`  Arreglo de Merge Sort ordenado: ${okOrden ? 'sí' : 'NO'}`);
  console.log('  Criterio: v está en la posición k ⇔ #(< v) ≤ k < #(≤ v)  (#: contado con búsqueda binaria)\n');
  const filasVal = [];
  const validar = (nombre, k, v) => {
    const cb = { comparaciones: 0 };
    const menores = C.cuantosMenores(ord, v, cb);
    const menoresOIg = C.cuantosMenoresOIg(ord, v, cb);
    const ok = menores <= k && k < menoresOIg && v === ord[k];
    filasVal.push([nombre, v, fmtN(k), fmtN(menores), fmtN(menoresOIg), `${((menoresOIg / n) * 100).toFixed(2)} %`, cb.comparaciones, ok ? '✔' : '✘']);
  };
  validar('Mediana (inf.)', kMedInf, H.res.medInf);
  validar('Mediana (sup.)', kMedSup, H.res.medSup);
  objetivos.forEach((o) => validar(o.nombre.toUpperCase(), o.k, H.res[o.nombre]));
  tabla(['Cuantil', 'Valor', 'k', '#(< v)', '#(≤ v)', '% ≤ v', 'Comp. bin.', 'OK'], filasVal);
  const coinciden = ['mediana', ...objetivos.map((o) => o.nombre)].every((q) => L.res[q] === desdeOrdenado[q] && H.res[q] === desdeOrdenado[q]);
  console.log(`\n  Lomuto, Hoare y Merge Sort coinciden en todos los cuantiles: ${coinciden ? 'sí' : 'NO'}`);
  console.log(`  Valores distintos en los datos: ${new Set(ord).size} (de −100 a 100) → cada valor se repite ≈ ${fmtN(n / new Set(ord).size)} veces.`);

  // ----- Reporte -----
  subtitulo('3. Reporte de rendimiento (n = 1.000.000; mediana + p50 + p90 + p95)');
  tabla(
    ['Enfoque', 'Tiempo', 'Comparaciones', 'Swaps / movim.', 'Particiones', 'Memoria adicional'],
    [
      ['Quickselect Lomuto', fmtMs(L.ms), fmtN(L.tot.comparaciones), fmtN(L.tot.swaps) + ' swaps', fmtN(L.tot.particiones), 'O(1) — in-place'],
      ['Quickselect Hoare', fmtMs(H.ms), fmtN(H.tot.comparaciones), fmtN(H.tot.swaps) + ' swaps', fmtN(H.tot.particiones), 'O(1) — in-place'],
      ['Merge Sort (1 vez)', fmtMs(mM.ms), fmtN(cM.comparaciones), fmtN(cM.movimientos) + ' movim.', '—', `Θ(n) — ${fmtBytes(cM.memoriaExtra)} (buffer)`],
    ]
  );
  console.log('\n  Detalle por cuantil (Quickselect):');
  tabla(
    ['Cuantil', 'Lomuto: tiempo', 'comparaciones', 'swaps', 'part.', 'Hoare: tiempo', 'comparaciones', 'swaps', 'part.'],
    L.res.detalle.map((d, i) => {
      const h = H.res.detalle[i];
      return [d.nombre, fmtMs(d.ms), fmtN(d.comparaciones), fmtN(d.swaps), d.particiones, fmtMs(h.ms), fmtN(h.comparaciones), fmtN(h.swaps), h.particiones];
    })
  );
  console.log(`\n  Referencia teórica: Quickselect promedio ≈ 2n–3,4n comparaciones (${fmtN(2 * n)}–${fmtN(3.4 * n)}) por cuantil;`);
  console.log(`  Merge Sort ≈ n·log₂n − n = ${fmtN(n * Math.log2(n) - n)} comparaciones. Copiar la entrada (${fmtBytes(n * 4)}) no se cuenta como memoria del algoritmo.`);

  // ----- Entradas adversas y repetidos -----
  subtitulo(`Entradas adversas y repetidos (n = ${fmtN(N_ADVERSO)}, buscando la mediana)`);
  const entradas = [
    ['Datos reales (muestra)', Int32Array.from(P.subarray(0, N_ADVERSO))],
    ['Ya ordenado', Int32Array.from({ length: N_ADVERSO }, (_, i) => i)],
    ['Todos iguales', new Int32Array(N_ADVERSO)],
  ];
  const kAdv = N_ADVERSO / 2;
  const filasAdv = [];
  for (const [nombre, base] of entradas) {
    const fila = [nombre];
    for (const [select] of [[C.quickselectLomuto], [C.quickselectHoare]]) {
      for (const piv of [C.pivoteFijo, C.pivoteAleatorio(rngConSemilla(7))]) {
        const c = C.nuevoContador();
        select(Int32Array.from(base), kAdv, piv, c);
        fila.push(fmtN(c.comparaciones));
      }
    }
    filasAdv.push(fila);
  }
  tabla(['Entrada', 'Lomuto pivote fijo', 'Lomuto aleatorio', 'Hoare pivote fijo', 'Hoare aleatorio'], filasAdv);
  console.log(`\n  Referencias: lineal ≈ 2n–4n = ${fmtN(2 * N_ADVERSO)}–${fmtN(4 * N_ADVERSO)}   ·   cuadrático ≈ n²/8–n²/2 = ${fmtN(N_ADVERSO ** 2 / 8)}–${fmtN(N_ADVERSO ** 2 / 2)}`);
  console.log('  (pivote fijo: último elemento en Lomuto, primero en Hoare)');

  subtitulo('Discusión');
  const porCuantil = (t) => t.comparaciones / L.res.detalle.length;
  [
    `• Resultado medido: por cuantil, Hoare hizo ≈ ${fmtN(porCuantil(H.tot))} comparaciones, Lomuto ≈ ${fmtN(porCuantil(L.tot))}`,
    `  y Merge Sort ${fmtN(cM.comparaciones)} para ordenar todo. Hoare queda cerca de la cota O(n); Lomuto se`,
    `  aleja por los repetidos, al punto de que sus ${L.res.detalle.length} selecciones (${fmtN(L.tot.comparaciones)}) superan a un solo Merge Sort.`,
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
  ].forEach((l) => console.log('  ' + l));
}

function main() {
  console.log('Cargando datos…');
  const { resultado: P, ms } = medir(() => cargarDatos());
  let suma = 0, pos = 0, min = Infinity, max = -Infinity;
  for (const x of P) { suma += x; if (x > 0) pos++; if (x < min) min = x; if (x > max) max = x; }
  console.log(`n = ${fmtN(P.length)} valores (rango ${min} a ${max}) leídos en ${fmtMs(ms)}`);
  console.log(`Utilidad total: ${fmtN(suma)}   días con ganancia: ${fmtN(pos)} (${((pos / P.length) * 100).toFixed(1)} %)`);

  parteA(P);
  parteB(P);
  parteC(P);
}

module.exports = { main };

// Permite ejecutarlo solo: node ejercicio4/utilidad.js
if (require.main === module) main();
