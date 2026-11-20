# parcialAyDA

Parcial de **Análisis y Diseño de Algoritmos** — Universidad Nacional de Villa Mercedes.
Resuelto en JavaScript (Node.js), un ejercicio por subcarpeta.

## Cómo ejecutar

Requiere Node.js (sin dependencias externas).

```bash
node index.js                    # menú interactivo con todos los ejercicios
node ejercicio1/corrector.js     # o cada ejercicio por separado
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
```

Para agregar un ejercicio al menú: crear la carpeta `ejercicioN/` con un módulo que
exporte `main()` y sumar una entrada en la lista `EJERCICIOS` de `index.js`.

## Ejercicios

| # | Tema | Algoritmos usados | Estado |
|---|------|-------------------|--------|
| 1 | Corrector ortográfico | AVL, Levenshtein (PD), búsqueda exhaustiva, BK-Tree, Counting Sort | ✔ Resuelto |
| 2 | — | — | Pendiente |
| 3 | — | — | Pendiente |
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
