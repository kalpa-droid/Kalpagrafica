# KALPAGRÁFICA — Plataforma de Diseño & CLI Utilitario

> Sistema web de alta precisión gráfica, catálogo visual de marcas y paquete de herramientas standalone para diseñadores y desarrolladores web.

---

## 🌟 Características Principales

- **Catálogo Visual de Marcas (Libro de Logos)**: Colección didáctica y de referencia técnica ordenada alfabéticamente de la `Num` a la `Z`, con visor de estructura geométrica, paletas cromáticas extraídas y atribución a diseñadores originales.
- **Suite de Herramientas (KalpaTools)**:
  - **Colorimetría OKLCH & Conversor**: Soporta HEX 6d, HEX 8d con alfa, RGB, HSL, CMYK, OKLCH y Pantone.
  - **Coincidencia Pantone PMS (C & U)**: Algoritmo no oficial de aproximación cromática para papel brillante (Coated) y mate (Uncoated).
  - **Generador de Sombras Tailwind CSS**: Escala de 50 a 950 interactiva.
  - **Armonías Cromáticas**: Complementario, análogo, triádico y tetrádico.
  - **Extractor de Paletas desde Imagen**: Con exportación en bloque (HEX, RGB, CMYK, Pantone, JSON).
  - **Simulador de Daltonismo**: En tiempo real sobre color e imágenes con descarga de PNG filtrado.
  - **Optimizador & Limpiador SVG (SVGO)**: Comprime archivos SVG sin deformar IDs vectoriales.
  - **Social Cropper**: Recorte de precisión para 9 formatos (Instagram, TikTok, YouTube, LinkedIn, Twitter, Pinterest, Etsy) con exportación en WEBP comprimido.
  - **Generador de Favicons & Conversor**: Favicons vectoriales con color de frente/fondo, y conversor PNG/JPEG/WEBP con vista previa y peso en KB.
  - **Marca de Agua (Stamp)**: Sello textual o gráfico SVG/PNG con opacidad y patrón mosaico.
  - **Escala Tipográfica & Papel**: 15 presets reales (Material 3, Apple HIG, Tailwind, Bringhurst, Vogue), conversor PX→REM, interlineado dinámico, vista previa de jerarquía y hoja mm real.
  - **Contador & Límites Redes Sociales**: 17 plataformas con campos oficiales de Facebook Reels, Meta Business Suite A/B Testing, YouTube, Instagram y más.

---

## 📦 Terminal Suite CLI (@kalpa-droid/delphitools)

Las herramientas de colorimetría y conversión se pueden ejecutar directamente en la terminal sin necesidad de descargar el entorno web completo:

### Instalación Global Npm (< 50 KB)

```bash
npm install -g @kalpa-droid/delphitools
```

### Uso Directo sin Instalación

```bash
npx @kalpa-droid/delphitools colour ffd42aff
```

### Comandos CLI Disponibles

```bash
# Conversión de color y coincidencia Pantone PMS Coated / Uncoated
dt colour #BAFDC1
dt colour "cmyk(0, 17, 84, 0)"
dt colour "115 C"

# Ficha técnica Pantone
dt pantone 115-c

# Generar 11 sombras Tailwind CSS (50-950)
dt tailwind-shades ffd42a

# Esquemas cromáticos armónicos
dt harmony ffd42a

# Ratio de contraste WCAG 2.1
dt contrast #BAFDC1 #111114
```

---

## 🛠️ Tecnologías & Arquitectura

- **Frontend**: React 19, Vite, Lucide Icons, Canvas API, DOMParser SVG.
- **Rendimiento**: Code-Splitting con `React.lazy()` y `Suspense`, renderizado defensivo y memoización.
- **Estilos**: Vanilla CSS con variables de diseño, glassmorphism y modo oscuro nativo.

---

## 📄 Licencia & Créditos

- **Inspiración Open Source**: Herramientas inspiradas en la suite de software libre [delphi.tools](https://delphi.tools/) por [@1612elphi](https://github.com/1612elphi/delphitools).
- **Aviso Legal de Pantone**: Las marcas y colores Pantone PMS (Coated / Uncoated) corresponden a un algoritmo de aproximación cromática no oficial. Este proyecto no está afiliado, licenciado ni avalado por Pantone LLC.
- **Aviso del Libro de Logos**: Las marcas y logotipos expuestos en el catálogo visual tienen un fin exclusivamente educativo, didáctico y de referencia técnica de diseño. Todos los derechos pertenecen a sus respectivos titulares.
