// =====================================================================
// BK-Tree (Burkhard–Keller) — búsqueda de palabras parecidas (Unidad 7)
// =====================================================================
//
// La Unidad 7 propone investigar el BK-Tree para optimizar el corrector.
//
// Estructura: cada nodo guarda una palabra, y cada hijo cuelga de una rama
// rotulada con su distancia de Levenshtein al padre.
//
// Búsqueda con tolerancia t: si la palabra buscada está a distancia d de un
// nodo, por la DESIGUALDAD TRIANGULAR solo pueden servir los hijos cuya rama
// esté entre d − t y d + t. Las demás ramas se descartan sin calcular nada.

const { distancia } = require('./levenshtein');

class NodoBK {
  constructor(palabra) {
    this.palabra = palabra;
    this.hijos = new Map(); // distancia al padre → nodo hijo
  }
}

class BKTree {
  constructor() {
    this.raiz = null;
  }

  insertar(palabra) {
    if (this.raiz === null) {
      this.raiz = new NodoBK(palabra);
      return;
    }

    // Se baja por la rama cuya distancia coincide, hasta encontrar un lugar libre.
    let nodo = this.raiz;
    while (true) {
      const distanciaAlNodo = distancia(palabra, nodo.palabra);
      if (distanciaAlNodo === 0) return; // la palabra ya está

      if (!nodo.hijos.has(distanciaAlNodo)) {
        nodo.hijos.set(distanciaAlNodo, new NodoBK(palabra));
        return;
      }
      nodo = nodo.hijos.get(distanciaAlNodo);
    }
  }

  // Devuelve las palabras a distancia ≤ tolerancia y qué nodos se visitaron.
  buscar(palabraBuscada, tolerancia) {
    const encontradas = [];
    const visitados = [];
    const pendientes = this.raiz ? [this.raiz] : [];

    while (pendientes.length > 0) {
      const nodo = pendientes.pop();
      const distanciaAlNodo = distancia(palabraBuscada, nodo.palabra);
      visitados.push(nodo.palabra);

      if (distanciaAlNodo <= tolerancia) {
        encontradas.push({ palabra: nodo.palabra, distancia: distanciaAlNodo });
      }

      // Poda: solo se exploran las ramas dentro de [d − t, d + t]
      const ramaMinima = distanciaAlNodo - tolerancia;
      const ramaMaxima = distanciaAlNodo + tolerancia;
      for (const [rama, hijo] of nodo.hijos) {
        if (rama >= ramaMinima && rama <= ramaMaxima) {
          pendientes.push(hijo);
        }
      }
    }

    return { encontradas, visitados };
  }

  // Dibujo con sangría: cada hijo debajo de su padre, con la distancia de su rama.
  dibujar() {
    const lineas = [];
    const dibujarNodo = (nodo, prefijo, etiqueta) => {
      lineas.push(`${prefijo}[${etiqueta}] ${nodo.palabra}`);
      const ramasOrdenadas = [...nodo.hijos].sort((a, b) => a[0] - b[0]);
      for (const [rama, hijo] of ramasOrdenadas) {
        dibujarNodo(hijo, prefijo + '    ', `d=${rama}`);
      }
    };
    if (this.raiz) dibujarNodo(this.raiz, '', 'raíz');
    return lineas;
  }
}

module.exports = { BKTree };
