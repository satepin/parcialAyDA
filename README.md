# parcialAyDA

Parcial de **Análisis y Diseño de Algoritmos** — Universidad Nacional de Villa Mercedes.
Resuelto en JavaScript (Node.js), un ejercicio por subcarpeta.

## Cómo ejecutar

Requiere Node.js (sin dependencias externas).

```bash
node index.js                    # menú interactivo con todos los ejercicios
node ejercicio1/corrector.js     # o cada ejercicio por separado
node ejercicio2/caminos.js
node ejercicio3/sopa.js
```

## Estructura

```
parcial/
├── index.js              # menú: elegir ejercicio, Enter para volver, 0 para salir
├── README.md
└── ejercicio1/           # Corrector ortográfico
    ├── corrector.js      # programa principal (exporta main())
    ├── levenshtein.js    # matriz de PD + reconstrucción del camino
    ├── avl.js            # árbol AVL para el diccionario
    ├── bktree.js         # BK-Tree para buscar palabras similares
    ├── ordenamiento.js   # Counting Sort estable
    └── salida.txt        # salida completa del programa
└── ejercicio2/           # Caminos mínimos
    ├── caminos.js        # programa principal (exporta main())
    ├── grafo.js          # vértices y arcos leídos del dibujo
    ├── floyd.js          # Floyd-Warshall + matriz de predecesores
    ├── grafo.png         # imagen del grafo de la consigna
    └── salida.txt        # salida completa del programa
└── ejercicio3/           # Sopa de letras
    ├── sopa.js           # programa principal (exporta main())
    ├── matriz.js         # matriz 20×20 transcripta y palabras a buscar
    ├── fuerzaBruta.js    # Brute Force String Match en 8 direcciones
    ├── sopa.png          # imagen de la sopa de letras de la consigna
    └── salida.txt        # salida completa del programa
```

Para agregar un ejercicio al menú: crear la carpeta `ejercicioN/` con un módulo que
exporte `main()` y sumar una entrada en la lista `EJERCICIOS` de `index.js`.

## Ejercicios

| # | Tema | Algoritmos usados | Estado |
|---|------|-------------------|--------|
| 1 | Corrector ortográfico | AVL, Levenshtein (PD), búsqueda exhaustiva, BK-Tree, Counting Sort | ✔ Resuelto |
| 2 | Caminos mínimos en grafo dirigido ponderado | Floyd-Warshall (PD), matriz de predecesores | ✔ Resuelto |
| 3 | Búsqueda de palabras en una sopa de letras | Brute Force String Match en 8 direcciones (búsqueda exhaustiva) | ✔ Resuelto |
| 4 | — | — | Pendiente |

---

### Ejercicio 1 — Corrector ortográfico

**Consigna.** Corregir la palabra `programaceón` contra el diccionario:
`programación`, `programador`, `programaciónes`, `programaciónal`, `programación web`,
`probabilístico`. Construir la matriz completa de distancias, seleccionar las palabras
con distancia ≤ 3, ordenarlas por distancia, reconstruir el camino óptimo e indicar qué
operaciones (inserción, eliminación, sustitución) se realizaron y en qué orden.

**Solución paso a paso**

| Paso | Qué hace | Algoritmo | Unidad |
|------|----------|-----------|--------|
| 1 | Verifica si la palabra existe en el diccionario | Árbol AVL — O(log n) | U6 · Transforma y Conquista |
| 2 | Calcula la matriz completa y el camino óptimo contra cada palabra | Levenshtein por tabulación — O(m·n) | U7 · Programación Dinámica |
| 2 | Compara contra todas las palabras de la lista | Búsqueda exhaustiva | U3 · Fuerza Bruta |
| 3 | Repite la búsqueda podando ramas (desigualdad triangular) | BK-Tree | U7 · Programación Dinámica |
| 4 | Ordena las sugerencias por distancia (estable) | Counting Sort — O(n + k) | U3 / TP3 |

**Recurrencia de Levenshtein**

```
D[i][0] = i        D[0][j] = j
D[i][j] = min( D[i-1][j]   + 1,          ↑ borrar
               D[i][j-1]   + 1,          ← insertar
               D[i-1][j-1] + costo )     ↖ sustituir (costo 0 si las letras son iguales)
```

**Resultados**

| Palabra | Distancia | Operaciones |
|---------|:---------:|-------------|
| programación | 1 | sustituir e→i |
| programaciónes | 3 | sustituir e→i, insertar e, insertar s |
| programaciónal | 3 | sustituir e→i, insertar a, insertar l |
| programador | 4 | borrar c, e→d, ó→o, n→r |
| programación web | 5 | sustituir e→i + 4 inserciones (` web`) |
| probabilístico | 11 | — |

El BK-Tree visita 4 de las 6 palabras y obtiene las mismas sugerencias que la búsqueda
exhaustiva.

```
¿Quisiste decir?

1. programación (distancia = 1)
2. programaciónes (distancia = 3)
3. programaciónal (distancia = 3)
```

> **Nota:** el ejemplo de la consigna muestra `programador (distancia = 3)`, pero la
> distancia real es 4 porque `ó ≠ o`; por eso queda fuera del umbral.

---

### Ejercicio 2 — Caminos mínimos con Floyd-Warshall

**Consigna.** Sobre el grafo dirigido ponderado de `ejercicio2/grafo.png`, aplicar
Floyd-Warshall y obtener: (1) distancia y camino mínimo de M a J, (2) de O a P,
(3) de C a K, (4) la matriz final de distancias, (5) la matriz de reconstrucción de
caminos y (6) verificar si existe algún ciclo negativo.

**Lectura del grafo** (13 vértices: A, B, C, D, E, H, I, J, K, L, M, O, P)

- Arcos de un solo sentido: `D→B (-2)`, `K→E (-1)`, `L→K (-2)`, `I→C (-2)`, `P→O (-3)`
- Flecha en ambos extremos (ida y vuelta, mismo peso): `A↔B 5`, `B↔E 4`, `B↔C 3`,
  `D↔E 3`, `D↔H 3`, `H↔K 2`, `H↔M 3`, `K↔O 3`, `E↔L 5`, `C↔L 7`, `E↔P 7`, `O↔I 6`,
  `I↔J 2`, `A↔J 5`, `J↔P 6`

Si alguna flecha se interpretó distinto, basta con corregir `grafo.js`.

**Algoritmo** (U7 · Programación Dinámica) — Θ(n³) en tiempo, Θ(n²) en espacio

```
para k en vértices:            // "¿mejora pasar por k?"
  para i, j en vértices:
    si D[i][k] + D[k][j] < D[i][j]:
      D[i][j] = D[i][k] + D[k][j]
      P[i][j] = P[k][j]        // predecesor de j en el camino i → j
```

El camino se reconstruye hacia atrás: `j, P[i][j], P[i][P[i][j]], …` hasta llegar a `i`.
Hay ciclo negativo si al final algún `D[i][i] < 0`.

**Resultados**

| # | Par | Camino mínimo | Cálculo | Distancia |
|---|-----|---------------|---------|:---------:|
| 1 | M → J | M → H → D → B → A → J | 3 + 3 − 2 + 5 + 5 | **14** |
| 2 | O → P | O → K → E → P | 3 − 1 + 7 | **9** |
| 3 | C → K | C → L → K | 7 − 2 | **5** |

**4. Matriz final de distancias D**

```
       A   B   C   D   E   H   I   J   K   L   M   O   P
   A   0   5   5  12   9  12   7   5  10  12  15   8  11
   B   5   0   3   7   4   9  12  10   7   9  12   8  11
   C   8   3   0   7   4   7  14  13   5   7  10   8  11
   D   3  -2   1   0   2   3  10   8   5   7   6   6   9
   E   6   1   4   3   0   5  10  11   3   5   8   4   7
   H   6   1   4   3   1   0  11  11   2   6   3   5   8
   I   6   1  -2   5   2   5   0   2   3   5   8   5   8
   J   5   3   0   7   4   7   2   0   5   7  10   3   6
   K   5   0   3   2  -1   2   9  10   0   4   5   3   6
   L   3  -2   1   0  -3   0   7   8  -2   0   3   1   4
   M   9   4   7   6   4   3  14  14   5   9   0   8  11
   O   8   3   4   5   2   5   6   8   3   7   8   0   9
   P   5   0   1   2  -1   2   3   5   0   4   5  -3   0
```

**5. Matriz de reconstrucción P** (vértice anterior a j en el camino de i a j)

```
       A   B   C   D   E   H   I   J   K   L   M   O   P
   A   -   A   I   E   B   K   J   A   L   C   H   P   J
   B   B   -   B   E   B   K   J   A   L   E   H   P   E
   C   B   C   -   E   K   K   O   A   L   C   H   K   E
   D   B   D   B   -   B   D   J   A   H   E   H   P   E
   E   B   D   B   E   -   K   O   A   L   E   H   P   E
   H   B   D   B   H   K   -   O   A   H   E   H   K   E
   I   B   C   I   E   K   K   -   I   L   C   H   P   J
   J   J   C   I   E   K   K   J   -   L   C   H   P   J
   K   B   D   B   E   K   K   O   A   -   E   H   K   E
   L   B   D   B   E   K   K   O   A   L   -   H   K   E
   M   B   D   B   H   K   M   O   A   H   E   -   K   E
   O   B   D   I   E   K   K   O   I   O   E   H   -   E
   P   B   D   I   E   K   K   O   I   O   E   H   P   -
```

**6. Ciclos negativos.** Toda la diagonal de D queda en 0 → **no existe ningún ciclo
negativo**; las distancias son válidas aunque haya arcos negativos. Los resultados se
verificaron además con Bellman-Ford desde cada vértice (coinciden).

---

### Ejercicio 3 — Sopa de letras

**Consigna.** Buscar en la matriz de `ejercicio3/sopa.png` (20 × 20) las palabras
`ARBOL`, `HEAPS`, `SORTS`, `NODOS` y `GRAFO`. Una palabra puede formarse recorriendo
celdas adyacentes en cualquiera de las ocho direcciones. El algoritmo se elige
libremente entre los de la teoría.

**1. Algoritmo elegido: Brute Force String Match en 8 direcciones** (U3 · Fuerza Bruta)

El String Match por fuerza bruta alinea el patrón en cada posición del texto y compara
carácter por carácter hasta la primera diferencia. Acá el texto es la matriz: la
palabra se alinea en **cada celda** y en **cada una de las 8 direcciones**
(→ ← ↓ ↑ ↘ ↖ ↙ ↗).

```
para cada palabra p (largo m):
  para cada celda (f, c) y cada dirección (df, dc):
    si la palabra no entra en la matriz → saltear
    k = 0
    mientras k < m y matriz[f + df·k][c + dc·k] == p[k]:  k++
    si k == m → aparición encontrada en (f, c) con dirección (df, dc)
```

Por qué este algoritmo:
- Es el algoritmo de búsqueda de patrones que da la teoría (U3).
- Es una **búsqueda exhaustiva**: revisa cada alineación una vez y encuentra todas las apariciones.
- Complejidad O(R · C · 8 · m). Con una matriz de 20 × 20 y palabras de 5 letras el costo es
  mínimo (≈ 2.400 comparaciones por palabra), así que no justifica una técnica más compleja.

**Resultados** (fila, columna — contando desde 1)

| Palabra | Inicio | Fin | Dirección |
|---------|:------:|:---:|-----------|
| ARBOL | (2,12) | (2,16) | horizontal → |
| HEAPS | (4,16) | (8,16) | vertical ↓ |
| SORTS | (13,12) | (13,16) | horizontal → |
| NODOS | (8,5) | (8,9) | horizontal → |
| GRAFO | (16,5) | (20,5) | vertical ↓ |

Cada palabra aparece exactamente una vez. Se probaron 2.304 alineaciones por palabra y
12.072 comparaciones de caracteres en total.

```
       1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
   2   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  A  R  B  O  L  ·  ·  ·  ·
   4   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  H  ·  ·  ·  ·
   5   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  E  ·  ·  ·  ·
   6   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  A  ·  ·  ·  ·
   7   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  P  ·  ·  ·  ·
   8   ·  ·  ·  ·  N  O  D  O  S  ·  ·  ·  ·  ·  ·  S  ·  ·  ·  ·
  13   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  S  O  R  T  S  ·  ·  ·  ·
  16   ·  ·  ·  ·  G  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  17   ·  ·  ·  ·  R  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  18   ·  ·  ·  ·  A  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  19   ·  ·  ·  ·  F  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  20   ·  ·  ·  ·  O  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
```

(Se muestran solo las filas que contienen letras de las palabras; la matriz completa
está en `salida.txt`.)
