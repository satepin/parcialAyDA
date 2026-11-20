// Max-Heap binario (Unidad 6 / TP3) representado en un arreglo:
//   hijos de i → 2i+1 y 2i+2   ·   padre de i → ⌊(i−1)/2⌋
// insertar: O(log n) (sift up)   ·   extraerMax: O(log n) (sift down)

class MaxHeap {
  constructor(clave = (x) => x) {
    this.a = [];
    this.clave = clave;
    this.comparaciones = 0;
  }

  get tamanio() { return this.a.length; }

  #mayor(i, j) {
    this.comparaciones++;
    return this.clave(this.a[i]) > this.clave(this.a[j]);
  }

  #swap(i, j) { [this.a[i], this.a[j]] = [this.a[j], this.a[i]]; }

  insertar(x) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const padre = (i - 1) >> 1;
      if (!this.#mayor(i, padre)) break;
      this.#swap(i, padre);
      i = padre;
    }
  }

  extraerMax() {
    if (this.a.length === 0) return undefined;
    const max = this.a[0];
    const ultimo = this.a.pop();
    if (this.a.length > 0) {
      this.a[0] = ultimo;
      let i = 0;
      while (true) {
        const izq = 2 * i + 1;
        const der = 2 * i + 2;
        let m = i;
        if (izq < this.a.length && this.#mayor(izq, m)) m = izq;
        if (der < this.a.length && this.#mayor(der, m)) m = der;
        if (m === i) break;
        this.#swap(i, m);
        i = m;
      }
    }
    return max;
  }
}

module.exports = { MaxHeap };
