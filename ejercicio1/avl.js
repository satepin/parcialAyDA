// Árbol AVL — Transforma y Conquista, Cambio de Representación (Unidad 6)
//
// El diccionario se guarda en un árbol binario de búsqueda equilibrado para
// comprobar si la palabra existe en O(log n) en lugar de recorrer la lista.
// Factor de Balance: FB = altura(izq) − altura(der), válido en {−1, 0, 1}.
// Si un nodo queda con |FB| = 2 se aplica una rotación simple o doble.

class NodoAVL {
  constructor(clave) {
    this.clave = clave;
    this.izq = null;
    this.der = null;
    this.altura = 1;
  }
}

const altura = (n) => (n ? n.altura : 0);
const fb = (n) => (n ? altura(n.izq) - altura(n.der) : 0);
const actualizar = (n) => { n.altura = 1 + Math.max(altura(n.izq), altura(n.der)); };
const comparar = (x, y) => x.localeCompare(y, 'es');

function rotarDerecha(y) {
  const x = y.izq;
  y.izq = x.der;
  x.der = y;
  actualizar(y);
  actualizar(x);
  return x;
}

function rotarIzquierda(x) {
  const y = x.der;
  x.der = y.izq;
  y.izq = x;
  actualizar(x);
  actualizar(y);
  return y;
}

class AVL {
  constructor() {
    this.raiz = null;
    this.cantidad = 0;
  }

  insertar(clave) {
    this.raiz = this.#insertar(this.raiz, clave.normalize('NFC'));
  }

  #insertar(nodo, clave) {
    if (!nodo) { this.cantidad++; return new NodoAVL(clave); }
    const c = comparar(clave, nodo.clave);
    if (c < 0) nodo.izq = this.#insertar(nodo.izq, clave);
    else if (c > 0) nodo.der = this.#insertar(nodo.der, clave);
    else return nodo; // ya existe

    actualizar(nodo);
    const balance = fb(nodo);

    // Rotación simple derecha (caso izquierda-izquierda)
    if (balance > 1 && comparar(clave, nodo.izq.clave) < 0) return rotarDerecha(nodo);
    // Rotación simple izquierda (caso derecha-derecha)
    if (balance < -1 && comparar(clave, nodo.der.clave) > 0) return rotarIzquierda(nodo);
    // Rotación doble izquierda + derecha (signos distintos)
    if (balance > 1 && comparar(clave, nodo.izq.clave) > 0) {
      nodo.izq = rotarIzquierda(nodo.izq);
      return rotarDerecha(nodo);
    }
    // Rotación doble derecha + izquierda
    if (balance < -1 && comparar(clave, nodo.der.clave) < 0) {
      nodo.der = rotarDerecha(nodo.der);
      return rotarIzquierda(nodo);
    }
    return nodo;
  }

  // Devuelve { encontrada, comparaciones, recorrido }
  buscar(clave) {
    clave = clave.normalize('NFC');
    let nodo = this.raiz;
    const recorrido = [];
    while (nodo) {
      recorrido.push(nodo.clave);
      const c = comparar(clave, nodo.clave);
      if (c === 0) return { encontrada: true, comparaciones: recorrido.length, recorrido };
      nodo = c < 0 ? nodo.izq : nodo.der;
    }
    return { encontrada: false, comparaciones: recorrido.length, recorrido };
  }

  inorden(nodo = this.raiz, salida = []) {
    if (nodo) {
      this.inorden(nodo.izq, salida);
      salida.push(nodo.clave);
      this.inorden(nodo.der, salida);
    }
    return salida;
  }

  get altura() { return altura(this.raiz); }

  // Dibujo del árbol rotado 90° (la raíz a la izquierda)
  dibujar(nodo = this.raiz, prefijo = '', lineas = []) {
    if (!nodo) return lineas;
    this.dibujar(nodo.der, prefijo + '        ', lineas);
    lineas.push(`${prefijo}${nodo.clave} (FB=${fb(nodo)})`);
    this.dibujar(nodo.izq, prefijo + '        ', lineas);
    return lineas;
  }
}

module.exports = { AVL };
