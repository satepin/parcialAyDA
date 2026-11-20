// Gráficos ASCII agregados/muestreados.
//
// Se grafica la UTILIDAD ACUMULADA S(i) = P[0] + ... + P[i]: el mejor período
// [l, r] es justamente la mayor "subida" de esa curva, ya que
//   suma(l..r) = S(r) − S(l−1).

function acumulada(P) {
  const S = new Float64Array(P.length);
  let s = 0;
  for (let i = 0; i < P.length; i++) { s += P[i]; S[i] = s; }
  return S;
}

// Curva de S en [desde, hasta], muestreada en `ancho` columnas y `alto` filas.
// Las columnas dentro de [resIni, resFin] se dibujan con '█'; el resto con '·'.
function curva(S, { desde = 0, hasta = S.length - 1, ancho = 100, alto = 18, resIni, resFin, titulo }) {
  const largo = hasta - desde + 1;
  const cols = Math.min(ancho, largo);
  const muestras = [];
  for (let c = 0; c < cols; c++) {
    const i = desde + Math.min(largo - 1, Math.round(((c + 1) * largo) / cols) - 1);
    const i0 = desde + Math.floor((c * largo) / cols);
    // La columna está resaltada si su tramo se superpone con el período óptimo
    muestras.push({ v: S[i], i, resaltada: i >= resIni && i0 <= resFin });
  }
  const min = Math.min(...muestras.map((m) => m.v));
  const max = Math.max(...muestras.map((m) => m.v));
  const fila = (v) => (max === min ? 0 : Math.round(((v - min) / (max - min)) * (alto - 1)));

  const grilla = Array.from({ length: alto }, () => new Array(cols).fill(' '));
  muestras.forEach((m, c) => {
    const f = fila(m.v);
    for (let r = 0; r <= f; r++) grilla[alto - 1 - r][c] = m.resaltada ? (r === f ? '█' : '▓') : r === f ? '•' : ' ';
  });

  if (titulo) console.log(titulo);
  const etiqueta = (r) => {
    if (r === 0) return String(Math.round(max));
    if (r === alto - 1) return String(Math.round(min));
    return '';
  };
  grilla.forEach((g, r) => console.log(etiqueta(r).padStart(8) + ' │' + g.join('')));
  console.log(' '.repeat(9) + '└' + '─'.repeat(cols));
  const izq = `i=${desde}`;
  const der = `i=${hasta}`;
  console.log(' '.repeat(10) + izq + ' '.repeat(Math.max(1, cols - izq.length - der.length)) + der);
}

// Franja de 1 línea: cada carácter representa n/ancho días; se marca con la
// etiqueta del período (0..9) que cae en ese tramo.
function franja(n, periodos, ancho = 100) {
  const linea = new Array(ancho).fill('·');
  periodos.forEach((p, k) => {
    const a = Math.floor((p.inicio * ancho) / n);
    const b = Math.floor((p.fin * ancho) / n);
    for (let c = a; c <= b; c++) linea[c] = String(k === 9 ? 0 : k + 1);
  });
  console.log('  │' + linea.join('') + '│');
  console.log('  0' + ' '.repeat(ancho - String(n - 1).length) + (n - 1));
  console.log(`  (cada carácter ≈ ${Math.round(n / ancho).toLocaleString('es-AR')} días; dígito = número de período, 0 = período 10)`);
}

module.exports = { acumulada, curva, franja };
