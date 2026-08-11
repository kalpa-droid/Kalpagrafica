#!/usr/bin/env node

// =============================================================================
// @kalpa-droid/delphitools — Suite CLI utilitaria para diseñadores gráficos
// Sintaxis nativa ES Modules (Node >=18.0.0), sin dependencias externas
// =============================================================================

import { styleText } from 'node:util';
import {
  parseAnyColorInput, rgbToHex, rgbToHsl, rgbToCmyk, approxOklch,
  findClosestPantone, generateTailwindShades, generateHarmonies, contrastRatio
} from '../lib/color.js';
import { PANTONE_COATED_DB, PANTONE_UNCOATED_DB } from '../lib/pantoneData.js';

const args = process.argv.slice(2);
const command = args[0];
const query = args[1];

const accent = (txt) => styleText(['bold', 'green'], txt);
const dim = (txt) => styleText('gray', txt);
const bold = (txt) => styleText('bold', txt);
const cyan = (txt) => styleText('cyan', txt);
const yellow = (txt) => styleText('yellow', txt);

function showHelp() {
  console.log(`
${accent('┌─────────────────────────────────────────────────────────────┐')}
${accent('│')}  ${bold('DelphiTools CLI')} — Suite de Colorimetría Kalpagráfica      ${accent('│')}
${accent('└─────────────────────────────────────────────────────────────┘')}

${bold('USO:')}
  ${cyan('dt <comando> <color/código> [opciones]')}

${bold('COMANDOS:')}
  ${cyan('dt colour <input>')}          Convierte cualquier color (HEX, RGB, HSL, CMYK, Pantone)
                               a HEX, HEX8, RGB, HSL, CMYK, OKLCH y Coincidencias Pantone C & U.
  ${cyan('dt pantone <código>')}         Busca una ficha técnica Pantone PMS (ej: 115-c, 286-u).
  ${cyan('dt tailwind-shades <color>')}  Genera la escala de 11 sombras (50 a 950) para Tailwind CSS.
  ${cyan('dt harmony <color>')}          Genera esquemas armónicos (complementario, análogo, triádico, tetrádico).
  ${cyan('dt contrast <c1> <c2>')}      Calcula el ratio de contraste WCAG 2.1 entre dos colores.

${bold('EJEMPLOS:')}
  dt colour ffd42a
  dt colour "rgb(255, 212, 42)"
  dt pantone 115-C
  dt tailwind-shades #BAFDC1
  dt harmony #BAFDC1
  dt contrast #BAFDC1 #111114
`);
}

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'colour':
  case 'color': {
    if (!query) {
      console.error(styleText('red', 'Error: Proporcioná un código de color. Ej: dt colour ffd42aff'));
      process.exit(1);
    }
    const parsed = parseAnyColorInput(query);
    if (!parsed) {
      console.error(styleText('red', `Error: Formato de color no reconocido "${query}".`));
      process.exit(1);
    }
    const { r, g, b, a } = parsed;
    const hex = rgbToHex(r, g, b);
    const alphaHex = Math.round((a !== undefined ? a : 1) * 255).toString(16).padStart(2, '0').toUpperCase();
    const hex8 = `${hex}${alphaHex}`;
    const { h, s, l } = rgbToHsl(r, g, b);
    const { c, m, y, k } = rgbToCmyk(r, g, b);
    const oklch = approxOklch(r, g, b);
    const pantone = findClosestPantone(r, g, b);

    console.log(`\n${accent('● Ficha técnica de Colorimetría:')} ${bold(query)}`);
    console.log(`${dim('───────────────────────────────────────────────────')}`);
    console.log(`  ${bold('HEX 6d:')}   ${cyan(hex)}`);
    console.log(`  ${bold('HEX 8d:')}   ${cyan(hex8)}`);
    console.log(`  ${bold('RGB:')}      rgb(${r}, ${g}, ${b})`);
    console.log(`  ${bold('HSL:')}      hsl(${h}, ${s}%, ${l}%)`);
    console.log(`  ${bold('CMYK:')}     cmyk(${c}%, ${m}%, ${y}%, ${k}%)`);
    console.log(`  ${bold('OKLCH:')}    ${oklch}`);
    console.log(`\n${accent('● Coincidencia Guía Pantone® PMS:')}`);
    console.log(`  ${bold('Coated (Brillante):')} ${yellow(pantone.coated.code)} (${pantone.coated.hex}) — Coincidencia: ${pantone.coated.similarity}`);
    console.log(`  ${bold('Uncoated (Mate):')}    ${yellow(pantone.uncoated.code)} (${pantone.uncoated.hex}) — Coincidencia: ${pantone.uncoated.similarity}\n`);
    break;
  }

  case 'pantone': {
    if (!query) {
      console.error(styleText('red', 'Error: Proporcioná un código Pantone. Ej: dt pantone 115-c'));
      process.exit(1);
    }
    const cleanQuery = query.toUpperCase().replace(/\s+/g, '');
    const coatedMatch = PANTONE_COATED_DB.find(item => {
      const c = (item.code || '').toUpperCase().replace(/\s+/g, '');
      return c === cleanQuery || c.includes(cleanQuery);
    });
    const uncoatedMatch = PANTONE_UNCOATED_DB.find(item => {
      const u = (item.code || '').toUpperCase().replace(/\s+/g, '');
      return u === cleanQuery || u.includes(cleanQuery);
    });

    if (!coatedMatch && !uncoatedMatch) {
      console.error(styleText('red', `Error: Código Pantone "${query}" no encontrado en las 2,682 fórmulas de la base.`));
      process.exit(1);
    }

    console.log(`\n${accent('● Ficha de Fórmula Pantone® PMS:')}`);
    console.log(`${dim('───────────────────────────────────────────────────')}`);
    if (coatedMatch) {
      console.log(`  ${bold('Pantone Coated (Brillante):')} ${yellow(coatedMatch.code)}`);
      console.log(`  ${bold('Valor HEX:')}                   ${cyan(coatedMatch.hex)}`);
    }
    if (uncoatedMatch) {
      console.log(`  ${bold('Pantone Uncoated (Mate):')}    ${yellow(uncoatedMatch.code)}`);
      console.log(`  ${bold('Valor HEX:')}                   ${cyan(uncoatedMatch.hex)}`);
    }
    console.log('');
    break;
  }

  case 'tailwind-shades':
  case 'shades': {
    if (!query) {
      console.error(styleText('red', 'Error: Proporcioná un color base. Ej: dt tailwind-shades #BAFDC1'));
      process.exit(1);
    }
    const parsed = parseAnyColorInput(query);
    if (!parsed) {
      console.error(styleText('red', `Error: Color invalido "${query}".`));
      process.exit(1);
    }
    const shades = generateTailwindShades(parsed.r, parsed.g, parsed.b);
    console.log(`\n${accent('● Escala de Sombras Tailwind CSS (50 - 950):')} para ${bold(query)}`);
    console.log(`${dim('───────────────────────────────────────────────────')}`);
    shades.forEach(s => {
      console.log(`  ${bold(String(s.weight).padStart(4))}:  ${cyan(s.hex)}`);
    });
    console.log('');
    break;
  }

  case 'harmony':
  case 'harmonies': {
    if (!query) {
      console.error(styleText('red', 'Error: Proporcioná un color base. Ej: dt harmony #BAFDC1'));
      process.exit(1);
    }
    const parsed = parseAnyColorInput(query);
    if (!parsed) {
      console.error(styleText('red', `Error: Color inválido "${query}".`));
      process.exit(1);
    }
    const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
    const schemes = generateHarmonies(hex);
    console.log(`\n${accent('● Esquemas Cromáticos Armónicos:')} para ${bold(hex)}`);
    console.log(`${dim('───────────────────────────────────────────────────')}`);
    schemes.forEach(sc => {
      console.log(`  ${bold(sc.label.padEnd(20))}: ${cyan(sc.colors.join(', '))}`);
    });
    console.log('');
    break;
  }

  case 'contrast': {
    const color1Input = args[1];
    const color2Input = args[2];
    if (!color1Input || !color2Input) {
      console.error(styleText('red', 'Error: Proporcioná dos colores para evaluar el contraste. Ej: dt contrast #BAFDC1 #111114'));
      process.exit(1);
    }
    const c1 = parseAnyColorInput(color1Input);
    const c2 = parseAnyColorInput(color2Input);
    if (!c1 || !c2) {
      console.error(styleText('red', 'Error: Uno o ambos colores no son válidos.'));
      process.exit(1);
    }
    const ratio = contrastRatio(c1, c2).toFixed(2);
    const passAA = ratio >= 4.5;
    const passAAA = ratio >= 7.0;

    console.log(`\n${accent('● Evaluación de Ratio de Contraste WCAG 2.1:')}`);
    console.log(`${dim('───────────────────────────────────────────────────')}`);
    console.log(`  ${bold('Color 1:')} ${cyan(rgbToHex(c1.r, c1.g, c1.b))}`);
    console.log(`  ${bold('Color 2:')} ${cyan(rgbToHex(c2.r, c2.g, c2.b))}`);
    console.log(`  ${bold('Ratio:')}   ${bold(ratio + ':1')} ${passAA ? accent('✓ PASS') : styleText('red', '⚠ FAIL')}`);
    console.log(`  ${bold('WCAG AA (Nivel Mínimo 4.5:1):')}  ${passAA ? accent('CUMPLE ✓') : styleText('red', 'NO CUMPLE ⚠')}`);
    console.log(`  ${bold('WCAG AAA (Nivel Máximo 7.0:1):')} ${passAAA ? accent('CUMPLE ✓') : styleText('yellow', 'NO CUMPLE')}\n`);
    break;
  }

  default:
    showHelp();
    process.exit(0);
}
