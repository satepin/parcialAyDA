// =====================================================================
// Gráficos de texto (ASCII), muestreados para que entren en pantalla
// =====================================================================
//
// Se grafica la UTILIDAD ACUMULADA:  S(i) = P[0] + P[1] + … + P[i].
// El mejor período [inicio, fin] es justamente la mayor "subida" de esa curva,
// porque  suma(inicio..fin) = S(fin) − S(inicio − 1).

function utilidadAcumulada(P) {
  const acumulada = new Float64Array(P.length);
  let suma = 0;
  for (let i = 0; i < P.length; i++) {
    suma += P[i];
    acumulada[i] = suma;
  }
  return acumulada;
}

// Dibuja la curva de `acumulada` entre los días `desde` y `hasta`, reducida a
// `ancho` columnas y `alto` filas. Las columnas que caen dentro del mejor
// período [inicioDestacado, finDestacado] se rellenan con '█'/'▓'; el resto
// se marca con un punto '•'.
function dibujarCurva(acumulada, opciones) {
  const {
    desde = 0,
    hasta = acumulada.length - 1,
    ancho = 100,
    alto = 18,
    inicioDestacado,
    finDestacado,
    titulo,
  } = opciones;

  const columnas = tomarMuestras(acumulada, desde, hasta, ancho, inicioDestacado, finDestacado);
  const minimo = Math.min(...columnas.map((c) => c.valor));
  const maximo = Math.max(...columnas.map((c) => c.valor));

  // Altura de cada columna, de 0 (el mínimo) a alto − 1 (el máximo)
  const alturaDe = (valor) => {
    if (maximo === minimo) return 0;
    return Math.round(((valor - minimo) / (maximo - minimo)) * (alto - 1));
  };

  // La grilla se arma de abajo hacia arriba: la fila 0 es la de arriba.
  const grilla = [];
  for (let fila = 0; fila < alto; fila++) {
    grilla.push(new Array(columnas.length).fill(' '));
  }
  columnas.forEach((columna, x) => {
    const tope = alturaDe(columna.valor);
    for (let nivel = 0; nivel <= tope; nivel++) {
      const esElTope = nivel === tope;
      let caracter;
      if (columna.destacada) {
        caracter = esElTope ? '█' : '▓';
      } else {
        caracter = esElTope ? '•' : ' ';
      }
      grilla[alto - 1 - nivel][x] = caracter;
    }
  });

  if (titulo) console.log(titulo);

  // Eje vertical: el máximo arriba y el mínimo abajo
  grilla.forEach((fila, numeroDeFila) => {
    let etiqueta = '';
    if (numeroDeFila === 0) etiqueta = String(Math.round(maximo));
    if (numeroDeFila === alto - 1) etiqueta = String(Math.round(minimo));
    console.log(etiqueta.padStart(8) + ' │' + fila.join(''));
  });

  // Eje horizontal: el primer y el último día del tramo
  console.log(' '.repeat(9) + '└' + '─'.repeat(columnas.length));
  const izquierda = `i=${desde}`;
  const derecha = `i=${hasta}`;
  const espacio = Math.max(1, columnas.length - izquierda.length - derecha.length);
  console.log(' '.repeat(10) + izquierda + ' '.repeat(espacio) + derecha);
}

// Reduce el tramo [desde, hasta] a `ancho` columnas. Cada columna representa
// un grupo de días y toma el valor del último día del grupo; queda destacada si
// su grupo se superpone con el período óptimo.
function tomarMuestras(acumulada, desde, hasta, ancho, inicioDestacado, finDestacado) {
  const largo = hasta - desde + 1;
  const cantidadColumnas = Math.min(ancho, largo);
  const columnas = [];

  for (let x = 0; x < cantidadColumnas; x++) {
    const primerDia = desde + Math.floor((x * largo) / cantidadColumnas);
    const ultimoDia = desde + Math.min(largo - 1, Math.round(((x + 1) * largo) / cantidadColumnas) - 1);
    columnas.push({
      valor: acumulada[ultimoDia],
      destacada: ultimoDia >= inicioDestacado && primerDia <= finDestacado,
    });
  }
  return columnas;
}

// Una sola línea que representa todo el arreglo: cada carácter son n/ancho
// días, y se marca con el número del período que cae ahí (0 = período 10).
function dibujarFranja(n, periodos, ancho = 100) {
  const linea = new Array(ancho).fill('·');

  periodos.forEach((periodo, indice) => {
    const numero = indice === 9 ? '0' : String(indice + 1);
    const desdeColumna = Math.floor((periodo.inicio * ancho) / n);
    const hastaColumna = Math.floor((periodo.fin * ancho) / n);
    for (let x = desdeColumna; x <= hastaColumna; x++) {
      linea[x] = numero;
    }
  });

  const diasPorCaracter = Math.round(n / ancho).toLocaleString('es-AR');
  console.log('  │' + linea.join('') + '│');
  console.log('  0' + ' '.repeat(ancho - String(n - 1).length) + (n - 1));
  console.log(`  (cada carácter ≈ ${diasPorCaracter} días; dígito = número de período, 0 = período 10)`);
}

module.exports = { utilidadAcumulada, dibujarCurva, dibujarFranja };
