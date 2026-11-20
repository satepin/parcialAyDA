# parcialAyDA

Parcial de **Análisis y Diseño de Algoritmos** — Universidad Nacional de Villa Mercedes.
Resuelto en JavaScript (Node.js), un ejercicio por subcarpeta.

## Cómo ejecutar

Requiere **Node.js 17 o superior** (sin dependencias externas).

**Con doble clic (lanzadores):**

| Sistema | Archivo | Cómo abrirlo |
|---------|---------|--------------|
| Windows | `ejecutar.bat` | Doble clic (o `ejecutar.bat` desde cmd / PowerShell) |
| Linux Mint | `ejecutar.sh` | Doble clic → *Ejecutar en terminal* (o `./ejecutar.sh`) |

Los dos se ubican en la carpeta del proyecto, verifican que Node.js esté instalado y en una
versión compatible, abren el menú y esperan una tecla al salir para que no se cierre la ventana.
En Windows activan UTF-8 (`chcp 65001`) para que se vean bien las tildes y las tablas.

En Linux, la primera vez hay que darle permiso de ejecución:

```bash
chmod +x ejecutar.sh
```

**Desde la terminal:**

```bash
node index.js                    # menú interactivo con todos los ejercicios
node ejercicio1/corrector.js     # o cada ejercicio por separado
node ejercicio2/caminos.js
node ejercicio3/sopa.js          # pregunta palabras nuevas; o: node ejercicio3/sopa.js DFS RED
node ejercicio4/utilidad.js      # ≈ 2–3 s (procesa 1.000.000 de datos)
```

## Estructura

```
parcial/
├── index.js              # menú: elegir ejercicio, Enter para volver, 0 para salir
├── ejecutar.bat          # lanzador para Windows
├── ejecutar.sh           # lanzador para Linux
├── .gitattributes        # finales de línea: CRLF para .bat, LF para .sh
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
    ├── sopa.js           # programa principal (exporta main()) + búsqueda de palabras nuevas
    ├── matriz.js         # matriz 20×20 transcripta y palabras a buscar
    ├── fuerzaBruta.js    # Brute Force String Match en 8 direcciones
    ├── sopa.png          # imagen de la sopa de letras de la consigna
    └── salida.txt        # salida completa del programa
└── ejercicio4/           # Mejor período de utilidad (1.000.000 de datos)
    ├── utilidad.js       # programa principal (exporta main()): partes A, B y C
    ├── datos.js          # carga datos_1mill_n.txt en un Int32Array
    ├── datos_1mill_n.txt # P[0..n−1], un entero por línea
    ├── subarreglo.js     # Kadane, Divide y Conquista, Fuerza Bruta
    ├── topk.js           # top-k no solapados (D&C incremental + heap) y PD de suma total
    ├── heap.js           # Max-Heap binario
    ├── cuantiles.js      # Quickselect (Lomuto / Hoare), Merge Sort, búsqueda binaria
    ├── grafico.js        # gráficos ASCII (utilidad acumulada y franja de períodos)
    ├── medicion.js       # cronómetro, tablas y generador aleatorio con semilla
    └── salida.txt        # salida completa del programa
```

Para agregar un ejercicio al menú: crear la carpeta `ejercicioN/` con un módulo que
exporte `main()` y sumar una entrada en la lista `EJERCICIOS` de `index.js`.

## Ejercicios

| # | Tema | Algoritmos usados | Estado |
|---|------|-------------------|--------|
| 1 | Corrector ortográfico | AVL, Levenshtein (PD), búsqueda exhaustiva, BK-Tree, Counting Sort | ✔ Resuelto |
| 2 | Caminos mínimos en grafo dirigido ponderado | Floyd-Warshall (PD), matriz de predecesores | ✔ Resuelto |
| 3 | Búsqueda de palabras en una sopa de letras (+ palabras nuevas) | Brute Force String Match en 8 direcciones (búsqueda exhaustiva) | ✔ Resuelto |
| 4 | Mejor período de utilidad con 1.000.000 de datos | Kadane, D&C, Fuerza Bruta, Max-Heap, PD, Quickselect (Lomuto/Hoare), Merge Sort, búsqueda binaria | ✔ Resuelto |

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

**Criterio de comparación:** las vocales con tilde cuentan igual que sin tilde
(`ó = o`, `á = a`, …), como pide la consigna. La `ñ` se mantiene distinta de la `n`.
La matriz muestra las letras originales; solo la comparación ignora la tilde. El AVL usa
el mismo criterio (`localeCompare` con `sensitivity: 'base'`).

**Resultados**

| Palabra | Distancia | Operaciones |
|---------|:---------:|-------------|
| programación | 1 | sustituir e→i |
| programador | 3 | borrar c, sustituir e→d, sustituir n→r (`ó = o` coincide) |
| programaciónes | 3 | sustituir e→i, insertar e, insertar s |
| programaciónal | 3 | sustituir e→i, insertar a, insertar l |
| programación web | 5 | sustituir e→i + 4 inserciones (` web`) |
| probabilístico | 11 | — |

El BK-Tree visita 5 de las 6 palabras (poda `probabilístico`) y obtiene las mismas
sugerencias que la búsqueda exhaustiva. Ante empates de distancia, el Counting Sort estable
respeta el orden del diccionario.

```
¿Quisiste decir?

1. programación (distancia = 1)
2. programador (distancia = 3)
3. programaciónes (distancia = 3)
4. programaciónal (distancia = 3)
```

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

**3. Adición: buscar una palabra nueva.** Después de las 5 palabras de la consigna, el
programa pide palabras por teclado y las busca con el mismo algoritmo (Enter vacío para
terminar). Se ignoran mayúsculas y tildes, se rechazan palabras con números o espacios y se
controla que el largo entre en la matriz. Para cada palabra muestra todas sus apariciones,
la dirección, las celdas, las comparaciones realizadas y las filas de la matriz donde aparece.

- Desde el menú (opción 3) o con `node ejercicio3/sopa.js`: pregunta por teclado.
- Sin preguntar: `node ejercicio3/sopa.js DFS RED SOL`.

El menú le pasa al ejercicio su propia interfaz de lectura (`main({ rl })`), así no hay dos
lectores del teclado a la vez.

| Palabra nueva | Apariciones | Dónde |
|---------------|:-----------:|-------|
| DFS | 2 | (5,14) vertical ↓ · (7,13) diagonal ↗ |
| RED | 1 | (1,2) horizontal → |
| SOL | 1 | (18,15) diagonal ↖ |

DFS (búsqueda en profundidad, Unidad 6) aparece dos veces y las dos apariciones comparten
la F de (6,14): el algoritmo encuentra apariciones que se cruzan porque prueba cada celda y
cada dirección por separado.

---

### Ejercicio 4 — Mejor período de utilidad con un millón de datos

**Consigna.** `P[0..n−1]`, con n = 1.000.000, contiene la utilidad diaria (ganancia − costo)
de una empresa. Determinar los mejores períodos contiguos según distintos criterios,
midiendo el rendimiento empírico y contrastándolo con la complejidad teórica.

**Datos:** 1.000.000 de enteros entre −100 y 100, con solo **201 valores distintos**
(cada uno se repite ≈ 5.000 veces). Utilidad total −39.329; 49,7 % de los días con ganancia.

> Los tiempos son de una corrida de referencia (Node.js 22) y varían según la máquina;
> las comparaciones son exactas y reproducibles (los pivotes aleatorios usan semilla).

#### Parte A — Sub-arreglo máximo (mejor período)

| Algoritmo | Unidad | Complejidad | Tiempo | Comparaciones | Cota teórica | Medido / cota |
|-----------|--------|-------------|-------:|--------------:|-------------:|:-------------:|
| Kadane | U7 · PD | Θ(n) | ≈ 3–6 ms | 2.000.000 | 2n = 2.000.000 | 1,00 |
| Divide y Conquista | U5 · D&C | Θ(n log n) | ≈ 130 ms | 21.951.422 | n·log₂n ≈ 19.931.569 | 1,10 |
| Fuerza bruta (muestra n = 10.000) | U3 · FB | Θ(n²) | ≈ 120–160 ms | 50.005.000 | n(n+1)/2 | 1,00 |
| Fuerza bruta (n = 10⁶, extrapolado) | U3 · FB | Θ(n²) | ≈ 20–27 min | ≈ 5·10¹¹ | n(n+1)/2 | — |

- **Kadane** (PD): `mejorTerminandoEn(i) = max(P[i], mejorTerminandoEn(i−1) + P[i])`.
- **Divide y Conquista**: el mejor período está a la izquierda, a la derecha o cruza el medio
  (sufijo máximo izquierdo + prefijo máximo derecho, Θ(n)). `T(n) = 2T(n/2) + Θ(n)` → Teorema
  Maestro caso 2 → Θ(n log n). D&C hace ≈ 11× las comparaciones de Kadane (la teoría predice
  log₂n / 2 ≈ 10×); en tiempo la diferencia es mayor por el costo de las 2n − 1 llamadas recursivas.

**Salida:** utilidad máxima **59.335**, en los días **121.945 a 233.209** (inclusive, 111.265
días). Los tres algoritmos dan el mismo período. El programa grafica en ASCII la utilidad
acumulada `S(i)`: el mejor período es la mayor subida de esa curva (`suma(l..r) = S(r) − S(l−1)`),
resaltada con `█`, y luego hace un zoom sobre ese tramo.

#### Parte B — Top 10 períodos no solapados

**Criterio (ranking voraz):** el período *t* es el mejor sub-arreglo que no se solapa con los
*t − 1* ya elegidos.

**Algoritmo — Divide y Conquista incremental + Max-Heap:** se aplica Kadane a `[0, n−1]` y su
mejor período entra a un Max-Heap (clave = utilidad). Se extrae el máximo, que **parte su
segmento en dos** (`[a, l−1]` y `[r+1, b]`); a cada mitad se le aplica Kadane y su mejor período
entra al heap. Se repite k veces.

| # | Utilidad | Inicio | Fin | Días |
|---|---------:|-------:|----:|-----:|
| 1 | 59.335 | 121.945 | 233.209 | 111.265 |
| 2 | 27.322 | 881.773 | 982.433 | 100.661 |
| 3 | 25.992 | 750.916 | 832.343 | 81.428 |
| 4 | 20.459 | 374.601 | 489.648 | 115.048 |
| 5 | 17.501 | 42.160 | 104.344 | 62.185 |
| 6 | 16.102 | 667.906 | 692.872 | 24.967 |
| 7 | 14.458 | 727.814 | 739.257 | 11.444 |
| 8 | 13.071 | 617.280 | 621.918 | 4.639 |
| 9 | 12.261 | 632.850 | 643.817 | 10.968 |
| 10 | 10.613 | 570.349 | 574.271 | 3.923 |

Suma: **217.114**, sin solapamientos.

**Costo y estructura de datos:** O(k·n) en el peor caso por Kadane sobre los segmentos, más
O(k log k) del heap (≤ 2k + 1 elementos, memoria O(k)). En la práctica se recorrieron 4,2·n
elementos (21 llamadas a Kadane, ≈ 20 ms) y el heap hizo solo 58 comparaciones.

**Contraste:** si el criterio fuera maximizar la **suma total** de 10 períodos disjuntos, el
óptimo exacto por Programación Dinámica en O(n·k) da **231.289** (6,1 % más que el voraz). El
voraz no maximiza la suma total porque toma primero el tramo más largo, que a veces rendiría
más partido en dos. Se eligió el ranking porque responde "cuáles fueron los mejores
períodos" y es incremental: el período 11 cuesta una sola extracción más.

#### Parte C — Mediana y percentiles

**Convenciones:** percentil *p* por rango más cercano, posición `k = ⌈p·n/100⌉ − 1`
(0-based). Como **n es par**, la mediana es el promedio de los dos centrales (posiciones
499.999 y 500.000). Con Quickselect se selecciona n/2 − 1 y el central superior es el mínimo
de la mitad derecha.

| Cuantil | Posición | Lomuto | Hoare | Merge Sort |
|---------|---------:|:------:|:-----:|:----------:|
| Mediana | (499.999 + 500.000)/2 | 0 | 0 | 0 |
| P50 | 499.999 | 0 | 0 | 0 |
| P90 | 899.999 | 80 | 80 | 80 |
| P95 | 949.999 | 90 | 90 | 90 |

**Validación:** sobre el arreglo de Merge Sort, con búsqueda binaria (≈ 40 comparaciones),
se comprueba `#(< v) ≤ k < #(≤ v)` para cada cuantil. Por ejemplo, P90 = 80: hay 895.380
valores < 80 y 900.404 ≤ 80 (90,04 %), así que la posición 899.999 cae en el bloque de los 80. ✔

**Reporte** (mediana + P50 + P90 + P95):

| Enfoque | Tiempo | Comparaciones | Swaps / movimientos | Particiones | Memoria adicional |
|---------|-------:|--------------:|--------------------:|------------:|-------------------|
| Quickselect Lomuto | ≈ 225 ms | 50.205.416 | 7.519.502 swaps | 12.708 | O(1), in-place |
| Quickselect Hoare | ≈ 80 ms | 11.311.605 | 1.835.554 swaps | 90 | O(1), in-place |
| Merge Sort (una vez) | ≈ 200 ms | 19.294.338 | 38.519.734 movim. | — | Θ(n) = 3,81 MB |

**Entradas adversas y repetidos** (n = 10.000, mediana; comparaciones):

| Entrada | Lomuto fijo | Lomuto aleatorio | Hoare fijo | Hoare aleatorio |
|---------|-----------:|-----------------:|-----------:|----------------:|
| Datos reales (muestra) | 29.080 | 23.501 | 24.042 | 19.690 |
| Ya ordenado | 37.497.500 | 50.436 | 37.512.501 | 50.537 |
| Todos iguales | 37.502.499 | 37.502.499 | 20.026 | 20.026 |

**Discusión**

- **Quickselect vs. ordenar todo:** para un solo cuantil, Quickselect descarta en cada paso
  la parte que no contiene k (n + n/2 + n/4 + … ≈ 2n → O(n), in-place). Ordenar cuesta
  Θ(n log n) y Merge Sort además usa un buffer de n elementos. Ordenar solo conviene si se
  van a pedir muchos cuantiles (se ordena una vez y cada consulta es O(1)).
- **Entradas adversas:** con pivote fijo, un arreglo ya ordenado degenera en O(n²) (cada
  partición descarta un elemento). El pivote aleatorio lo evita en la práctica; la garantía
  O(n) en el peor caso la da la mediana de medianas (BFPRT).
- **Repetidos:** es exactamente el caso de estos datos. Lomuto manda los iguales al pivote a
  un solo lado y, en un bloque de valores iguales, avanza de a un elemento: miles de
  particiones y ≈ 4,4× las comparaciones de Hoare. Sus 4 selecciones llegan a superar a un
  Merge Sort completo. Hoare se detiene también en los iguales y los reparte entre ambos lados,
  por eso parte por la mitad incluso con todos los valores iguales. Con muchos repetidos conviene
  Hoare o una partición en tres vías (<, =, >).
