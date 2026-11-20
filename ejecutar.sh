#!/usr/bin/env bash
# Lanzador para Linux (probado para Linux Mint).
# Uso: ./ejecutar.sh   o doble clic → "Ejecutar en terminal"

# Si se abrió con doble clic sin terminal, se vuelve a abrir dentro de una.
if [ ! -t 0 ] && [ -z "$EJECUTAR_EN_TERMINAL" ]; then
  export EJECUTAR_EN_TERMINAL=1
  for term in x-terminal-emulator gnome-terminal mate-terminal xfce4-terminal konsole xterm; do
    if command -v "$term" >/dev/null 2>&1; then
      case "$term" in
        gnome-terminal) exec "$term" -- bash "$0" ;;
        *) exec "$term" -e bash "$0" ;;
      esac
    fi
  done
fi

# Ir a la carpeta del script (funciona desde cualquier directorio)
cd "$(dirname "$(readlink -f "$0")")" || exit 1

pausa() { echo; read -r -p "Presioná Enter para cerrar..." _; }

if ! command -v node >/dev/null 2>&1; then
  echo "No se encontró Node.js."
  echo "Instalalo con:  sudo apt install nodejs   (o desde https://nodejs.org)"
  pausa
  exit 1
fi

MAYOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$MAYOR" -lt 17 ]; then
  echo "Se necesita Node.js 17 o superior (versión instalada: $(node -v))."
  echo "Instalá una versión más nueva desde https://nodejs.org"
  pausa
  exit 1
fi

node index.js
pausa
