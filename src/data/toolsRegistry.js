import { 
  Palette, 
  Ruler, 
  ScanEye, 
  Code, 
  Crop, 
  FileImage, 
  Terminal, 
  BookOpen, 
  CreditCard,
  Wrench
} from 'lucide-react';

/**
 * REGISTRO DINÁMICO DE HERRAMIENTAS DE KALPAGRÁFICA
 * Cualquier nueva herramienta que se agregue a este arreglo aparecerá
 * automáticamente en el Panel Lateral de Herramientas (Drawer Derecho) 
 * y en los menúes navegables del sitio.
 */
export const TOOLS_REGISTRY = [
  {
    id: 'colour',
    sectionId: 'herramientas',
    title: 'Color OKLCH & Pantone® PMS',
    category: 'Colorimetría',
    icon: Palette,
    description: 'Conversión OKLCH, coincidencia Pantone Coated/Uncoated y armonías cromáticas.'
  },
  {
    id: 'type',
    sectionId: 'herramientas',
    title: 'Escala Tipográfica & Papel',
    category: 'Editorial',
    icon: Ruler,
    description: '15 presets de escalas tipográficas reales y cálculo de pliegos A4/A5.'
  },
  {
    id: 'analysis',
    sectionId: 'herramientas',
    title: 'Paletas & Visión Daltonismo',
    category: 'Accesibilidad',
    icon: ScanEye,
    description: 'Extracción de paletas desde imágenes y simulación diagnóstica de daltonismo.'
  },
  {
    id: 'svg',
    sectionId: 'herramientas',
    title: 'Optimizador SVG & Marcas de Agua',
    category: 'Vectores',
    icon: Code,
    description: 'Limpieza de código vectorial SVG y aplicación de marcas de agua.'
  },
  {
    id: 'social',
    sectionId: 'herramientas',
    title: 'Social Cropper WebP',
    category: 'Medios',
    icon: Crop,
    description: 'Recorte con proporciones oficiales para redes sociales y exportación WebP.'
  },
  {
    id: 'assets',
    sectionId: 'herramientas',
    title: 'Generador de Favicon & Assets',
    category: 'Marca',
    icon: FileImage,
    description: 'Exportación de paquetes de favicons web, app icons e identidades visuales.'
  },
  {
    id: 'cli',
    sectionId: 'herramientas',
    title: 'Comandos CLI @kalpa-droid',
    category: 'Terminal',
    icon: Terminal,
    description: 'Suite utilitaria ejecutable standalone directamente en la consola de comandos.'
  },
  {
    id: 'impresion-libro',
    sectionId: 'impresion',
    title: 'Maquetador PDF & Tapas A5',
    category: 'Impresión',
    icon: BookOpen,
    description: 'Creación de PDF fotocopia, tapas/contratapas A5 y recorte personalizado.'
  },
  {
    id: 'editor-tarjetas',
    sectionId: 'editor-tarjetas',
    title: 'Editor Gráfico de Tarjetas',
    category: 'Diseño Táctil',
    icon: CreditCard,
    description: 'Editor de tarjetas de presentación y credenciales con plantillas en tiempo real.'
  }
];
