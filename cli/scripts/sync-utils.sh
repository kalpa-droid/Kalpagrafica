#!/usr/bin/env bash
# =============================================================================
# KALPAGRÁFICA — Script de Sincronización Automática Web ↔ CLI
# Copia src/utils/ hacia cli/lib/ agregando la extensión .js a los imports ESM nativos
# =============================================================================

mkdir -p cli/lib
cp src/utils/pantoneData.js cli/lib/pantoneData.js
cp src/utils/color.js cli/lib/color.js

# Asegura extensión .js para ESM nativo de Node.js
sed -i "s/import { PANTONE_COATED_DB, PANTONE_UNCOATED_DB } from '\.\/pantoneData';/import { PANTONE_COATED_DB, PANTONE_UNCOATED_DB } from '\.\/pantoneData\.js';/g" cli/lib/color.js

echo "✓ Utilidades sincronizadas correctamente en cli/lib/"
