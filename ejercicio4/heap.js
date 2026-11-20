// =====================================================================
// Max-Heap binario (Unidad 6 / TP3)
// =====================================================================
//
// Árbol binario completo guardado en un arreglo, donde cada padre es mayor o
// igual que sus hijos: el máximo siempre está en la raíz (posición 0).
//
//   hijos de la posición i → 2i + 1 y 2i + 2
//   padre de la posición i → ⌊(i − 1) / 2⌋
//
//   insertar:   O(log n) — se agrega al final y SUBE mientras supere a su padre
//   extraerMax: O(log n) — el último pasa a la raíz y BAJA mientras un hijo lo supere
//
// obtenerClave(elemento) dice por qué número se ordena (en la parte B, la suma).

class MaxHeap {
  constructor(obtenerClave = (elemento) => elemento) {
    this.elementos = [];
    this.obtenerClave = obtenerClave;
    this.comparaciones = 0;
  }

  get tamanio() {
    return this.elementos.length;
  }

  insertar(elemento) {
    this.elementos.push(elemento);
    this.#subir(this.elementos.length - 1);
  }

  extraerMax() {
    if (this.elementos.length === 0) return undefined;

    const maximo = this.elementos[0];
    const ultimo = this.elementos.pop();
    if (this.elementos.length > 0) {
      this.elementos[0] = ultimo;
      this.#bajar(0);
    }
    return maximo;
  }

  // Sift up: intercambia con el padre mientras sea mayor que él.
  #subir(posicion) {
    while (posicion > 0) {
      const padre = Math.floor((posicion - 1) / 2);
      if (!this.#esMayor(posicion, padre)) break;
      this.#intercambiar(posicion, padre);
      posicion = padre;
    }
  }

  // Sift down: intercambia con el hijo mayor mientras alguno lo supere.
  #bajar(posicion) {
    const cantidad = this.elementos.length;
    while (true) {
      const izquierdo = 2 * posicion + 1;
      const derecho = 2 * posicion + 2;
      let mayor = posicion;

      if (izquierdo < cantidad && this.#esMayor(izquierdo, mayor)) mayor = izquierdo;
      if (derecho < cantidad && this.#esMayor(derecho, mayor)) mayor = derecho;
      if (mayor === posicion) break;

      this.#intercambiar(posicion, mayor);
      posicion = mayor;
    }
  }

  #esMayor(i, j) {
    this.comparaciones++;
    return this.obtenerClave(this.elementos[i]) > this.obtenerClave(this.elementos[j]);
  }

  #intercambiar(i, j) {
    [this.elementos[i], this.elementos[j]] = [this.elementos[j], this.elementos[i]];
  }
}

module.exports = { MaxHeap };
