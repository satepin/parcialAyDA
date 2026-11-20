// Grafo dirigido ponderado del ejercicio 2 (ver grafo.png).
//
// Lectura del dibujo:
//  - Flecha en UN extremo  → arco dirigido (solo en ese sentido).
//  - Flecha en AMBOS extremos → dos arcos, uno en cada sentido, con el mismo peso.
// Si alguna dirección se leyó distinto, alcanza con corregir esta lista.

const VERTICES = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'P'];

// [origen, destino, peso]
const DIRIGIDAS = [
  ['D', 'B', -2],
  ['K', 'E', -1],
  ['L', 'K', -2],
  ['I', 'C', -2],
  ['P', 'O', -3],
];

// [u, v, peso] → u→v y v→u
const BIDIRECCIONALES = [
  ['A', 'B', 5],
  ['B', 'E', 4],
  ['B', 'C', 3],
  ['D', 'E', 3],
  ['D', 'H', 3],
  ['H', 'K', 2],
  ['H', 'M', 3],
  ['K', 'O', 3],
  ['E', 'L', 5],
  ['C', 'L', 7],
  ['E', 'P', 7],
  ['O', 'I', 6],
  ['I', 'J', 2],
  ['A', 'J', 5],
  ['J', 'P', 6],
];

const ARCOS = [
  ...DIRIGIDAS,
  ...BIDIRECCIONALES.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]]),
];

module.exports = { VERTICES, DIRIGIDAS, BIDIRECCIONALES, ARCOS };
