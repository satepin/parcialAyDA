// Parcial — Análisis y Diseño de Algoritmos
// Uso: node index.js

const readline = require('readline/promises');

// Para agregar un ejercicio: sumar una entrada con su nombre y el módulo
// que exporta main(). main recibe { rl } por si necesita pedir datos al usuario.
const EJERCICIOS = [
  { nombre: 'Corrector ortográfico (distancia de Levenshtein)', modulo: './ejercicio1/corrector' },
  { nombre: 'Caminos mínimos (Floyd-Warshall)', modulo: './ejercicio2/caminos' },
  { nombre: 'Sopa de letras (Brute Force String Match)', modulo: './ejercicio3/sopa' },
  { nombre: 'Mejor período de utilidad con un millón de datos', modulo: './ejercicio4/utilidad' },
];

function mostrarMenu() {
  console.log('\n' + '='.repeat(50));
  console.log('  PARCIAL — Análisis y Diseño de Algoritmos');
  console.log('='.repeat(50));
  EJERCICIOS.forEach((e, i) => console.log(`  ${i + 1}. Ejercicio ${i + 1}: ${e.nombre}`));
  console.log('  0. Salir');
  console.log('='.repeat(50));
}

async function principal() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    mostrarMenu();
    const opcion = (await rl.question('Elegí una opción: ')).trim();

    if (opcion === '0') break;

    const indice = Number(opcion) - 1;
    const ejercicio = EJERCICIOS[indice];
    if (!Number.isInteger(indice) || !ejercicio) {
      console.log('Opción inválida.');
      continue;
    }

    console.log(`\n>>> Ejercicio ${indice + 1}: ${ejercicio.nombre}\n`);
    try {
      // Se comparte la misma interfaz de lectura: si un ejercicio abriera la
      // suya, las dos leerían el teclado a la vez y se pisarían.
      await require(ejercicio.modulo).main({ rl });
    } catch (err) {
      console.error('Error al ejecutar el ejercicio:', err);
    }
    await rl.question('\nPresioná Enter para volver al menú...');
  }

  rl.close();
  console.log('¡Hasta luego!');
}

principal();
