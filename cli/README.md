# @kalpa-droid/delphitools

> Suite CLI utilitaria para diseñadores gráficos y desarrolladores web.

Colorimetría OKLCH, conversión perceptualmente ponderada con las 2,682 muestras de **Pantone® Coated (C)** y **Uncoated (U)** (algoritmo de aproximación independiente y no oficial), generación de sombras Tailwind CSS 50–950, esquemas cromáticos armónicos y evaluación de accesibilidad WCAG 2.1.

---

## 🚀 Instalación Global (Solo herramientas, < 50 KB)

```bash
npm install -g @kalpa-droid/delphitools
```

O ejecútalo directamente sin instalar usando `npx`:

```bash
npx @kalpa-droid/delphitools colour ffd42aff
```

---

## ⚡ Comandos Disponibles

### 1. `dt colour <color>`
Convierte cualquier entrada (HEX 6d, HEX 8d con alfa, RGB, HSL, CMYK, OKLCH o Pantone) y devuelve la coincidencia más cercana en las guías Pantone Coated (brillante) y Uncoated (mate):

```bash
dt colour ffd42aff
dt colour "rgb(255, 212, 42)"
```

### 2. `dt pantone <código>`
Busca una fórmula específica en la base de datos de 2,682 colores Pantone:

```bash
dt pantone 115-c
dt pantone 286-u
```

### 3. `dt tailwind-shades <color>`
Genera la escala de 11 sombras (50 a 950) para Tailwind CSS:

```bash
dt tailwind-shades #BAFDC1
```

### 4. `dt harmony <color>`
Genera esquemas de color armónicos (complementario, análogo, triádico, tetrádico, monocromático):

```bash
dt harmony #BAFDC1
```

### 5. `dt contrast <color1> <color2>`
Calcula el ratio de contraste de legibilidad WCAG 2.1 (AA y AAA):

```bash
dt contrast #BAFDC1 #111114
```

---

## 🙏 Créditos & Reconocimiento Open Source

Esta suite utilitaria está basada e inspirada en el proyecto de software libre [delphi.tools](https://delphi.tools/) desarrollado por [@1612elphi](https://github.com/1612elphi/delphitools).

---

## 🛡️ Licencia

MIT © Kalpagráfica
