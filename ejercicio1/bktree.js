// BK-Tree (Burkhard–Keller) — árbol métrico para búsqueda de palabras similares
// (propuesto en la Unidad 7 para optimizar el corrector ortográfico).
//
// Cada nodo guarda una palabra; sus hijos se indexan por la distancia de
// Levenshtein al padre. Al buscar con tolerancia t, si la consulta está a
// distancia d del nodo, por la DESIGUALDAD TRIANGULAR solo pueden servir los
// hijos con clave en [d − t, d + t]; el resto de las ramas se poda sin calcular.

const { distancia } = require('./levenshtein');

class NodoBK {
  constructor(palabra) {
    this.palabra = palabra;
    this.hijos = new Map(); // distancia → NodoBK
  }
}

class BKTree {
  constructor() {
    this.raiz = null;
  }

  insertar(palabra) {
    if (!this.raiz) { this.raiz = new NodoBK(palabra); return; }
    let nodo = this.raiz;
    while (true) {
      const d = distancia(palabra, nodo.palabra);
      if (d === 0) return; // ya está
      if (!nodo.hijos.has(d)) { nodo.hijos.set(d, new NodoBK(palabra)); return; }
      nodo = nodo.hijos.get(d);
    }
  }

  // Devuelve { resultados: [{palabra, distancia}], visitados: [palabra...] }
  buscar(consulta, tolerancia) {
    const resultados = [];
    const visitados = [];
    const pila = this.raiz ? [this.raiz] : [];
    while (pila.length) {
      const nodo = pila.pop();
      const d = distancia(consulta, nodo.palabra);
      visitados.push(nodo.palabra);
      if (d <= tolerancia) resultados.push({ palabra: nodo.palabra, distancia: d });
      for (const [k, hijo] of nodo.hijos) {
        if (k >= d - tolerancia && k <= d + tolerancia) pila.push(hijo);
      }
    }
    return { resultados, visitados };
  }

  dibujar(nodo = this.raiz, prefijo = '', etiqueta = 'raíz', lineas = []) {
    if (!nodo) return lineas;
    lineas.push(`${prefijo}[${etiqueta}] ${nodo.palabra}`);
    for (const [k, hijo] of [...nodo.hijos].sort((x, y) => x[0] - y[0])) {
      this.dibujar(hijo, prefijo + '    ', `d=${k}`, lineas);
    }
    return lineas;
  }
}

module.exports = { BKTree };
