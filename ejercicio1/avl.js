// =====================================================================
// Árbol AVL — Transforma y Conquista, cambio de representación (Unidad 6)
// =====================================================================
//
// El diccionario se guarda en un árbol binario de búsqueda EQUILIBRADO. Así,
// saber si una palabra existe cuesta O(log n) en lugar de recorrer la lista.
//
// Factor de balance (FB) de un nodo = altura del subárbol izquierdo
//                                    − altura del subárbol derecho.
// En un AVL todos los nodos tienen FB = −1, 0 o 1. Si una inserción deja un
// nodo con FB = 2 o −2, se corrige con una rotación:
//   - mismo signo que su hijo   → rotación SIMPLE
//   - distinto signo que su hijo → rotación DOBLE
//
// Las palabras se comparan ignorando las tildes (mismo criterio que en
// Levenshtein): "programacion" y "programación" son la misma clave.

class NodoAVL {
  constructor(palabra) {
    this.palabra = palabra;
    this.izquierdo = null;
    this.derecho = null;
    this.altura = 1; // un nodo sin hijos tiene altura 1
  }
}

// Orden alfabético en castellano. sensitivity 'base' ignora las tildes,
// pero distingue la ñ de la n.
function compararPalabras(palabraA, palabraB) {
  return palabraA.localeCompare(palabraB, 'es', { sensitivity: 'base' });
}

function alturaDe(nodo) {
  return nodo ? nodo.altura : 0;
}

function factorDeBalance(nodo) {
  return nodo ? alturaDe(nodo.izquierdo) - alturaDe(nodo.derecho) : 0;
}

function actualizarAltura(nodo) {
  nodo.altura = 1 + Math.max(alturaDe(nodo.izquierdo), alturaDe(nodo.derecho));
}

// --- Rotaciones ---
//
//   Rotación a la derecha:        Rotación a la izquierda:
//         y            x               x                y
//        / \          / \             / \              / \
//       x   C   →    A   y           A   y      →     x   C
//      / \              / \             / \          / \
//     A   B            B   C           B   C        A   B

function rotarDerecha(y) {
  const x = y.izquierdo;
  y.izquierdo = x.derecho;
  x.derecho = y;
  actualizarAltura(y);
  actualizarAltura(x);
  return x; // nueva raíz del subárbol
}

function rotarIzquierda(x) {
  const y = x.derecho;
  x.derecho = y.izquierdo;
  y.izquierdo = x;
  actualizarAltura(x);
  actualizarAltura(y);
  return y; // nueva raíz del subárbol
}

// Si el nodo quedó desbalanceado, aplica la rotación que corresponde.
function rebalancear(nodo) {
  const balance = factorDeBalance(nodo);

  if (balance > 1) {
    // Cargado a la izquierda
    if (factorDeBalance(nodo.izquierdo) < 0) {
      // Signos distintos → rotación doble (izquierda + derecha)
      nodo.izquierdo = rotarIzquierda(nodo.izquierdo);
    }
    return rotarDerecha(nodo);
  }

  if (balance < -1) {
    // Cargado a la derecha
    if (factorDeBalance(nodo.derecho) > 0) {
      // Signos distintos → rotación doble (derecha + izquierda)
      nodo.derecho = rotarDerecha(nodo.derecho);
    }
    return rotarIzquierda(nodo);
  }

  return nodo; // ya estaba balanceado
}

class AVL {
  constructor() {
    this.raiz = null;
    this.cantidad = 0;
  }

  get altura() {
    return alturaDe(this.raiz);
  }

  insertar(palabra) {
    this.raiz = this.#insertarEn(this.raiz, palabra.normalize('NFC'));
  }

  // Inserción recursiva: baja como en un árbol de búsqueda común y, al
  // volver de la recursión, actualiza alturas y rebalancea cada nodo.
  #insertarEn(nodo, palabra) {
    if (nodo === null) {
      this.cantidad++;
      return new NodoAVL(palabra);
    }

    const comparacion = compararPalabras(palabra, nodo.palabra);
    if (comparacion < 0) {
      nodo.izquierdo = this.#insertarEn(nodo.izquierdo, palabra);
    } else if (comparacion > 0) {
      nodo.derecho = this.#insertarEn(nodo.derecho, palabra);
    } else {
      return nodo; // la palabra ya está en el árbol
    }

    actualizarAltura(nodo);
    return rebalancear(nodo);
  }

  // Búsqueda iterativa. Devuelve si la encontró, cuántas comparaciones hizo
  // y por qué nodos pasó (para mostrarlo).
  buscar(palabra) {
    const buscada = palabra.normalize('NFC');
    const recorrido = [];
    let nodo = this.raiz;

    while (nodo !== null) {
      recorrido.push(nodo.palabra);
      const comparacion = compararPalabras(buscada, nodo.palabra);

      if (comparacion === 0) {
        return { encontrada: true, comparaciones: recorrido.length, recorrido };
      }
      nodo = comparacion < 0 ? nodo.izquierdo : nodo.derecho;
    }

    return { encontrada: false, comparaciones: recorrido.length, recorrido };
  }

  // Recorrido InOrden: izquierdo, nodo, derecho → las palabras salen ordenadas.
  inorden() {
    const palabras = [];
    const recorrer = (nodo) => {
      if (nodo === null) return;
      recorrer(nodo.izquierdo);
      palabras.push(nodo.palabra);
      recorrer(nodo.derecho);
    };
    recorrer(this.raiz);
    return palabras;
  }

  // Dibujo del árbol acostado (la raíz a la izquierda, el subárbol derecho arriba).
  dibujar() {
    const lineas = [];
    const sangria = '        ';
    const dibujarNodo = (nodo, prefijo) => {
      if (nodo === null) return;
      dibujarNodo(nodo.derecho, prefijo + sangria);
      lineas.push(`${prefijo}${nodo.palabra} (FB=${factorDeBalance(nodo)})`);
      dibujarNodo(nodo.izquierdo, prefijo + sangria);
    };
    dibujarNodo(this.raiz, '');
    return lineas;
  }
}

module.exports = { AVL };
