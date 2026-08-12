import { 
  Palette, 
  Ruler, 
  ScanEye, 
  Code, 
  Crop, 
  FileImage, 
  Terminal, 
  BookOpen, 
  LayoutGrid,
  FileType,
  CreditCard,
  GraduationCap,
  Users,
  Wand2
} from 'lucide-react';

/**
 * REGISTRO DINÁMICO DE TODAS LAS HERRAMIENTAS Y MÓDULOS DE KALPAGRÁFICA
 * REGLA AUTOMÁTICA: Cualquier nueva herramienta que se registre en este arreglo
 * aparecerá automáticamente en la grilla de 2 columnas del Panel Lateral
 * de Herramientas tanto en celulares como en pantalla web.
 */
export const TOOLS_REGISTRY = [
  // Tools Impresión
  {
    id: 'libro',
    sectionId: 'impresion',
    title: 'PDF a Libro (Folleto)',
    category: 'Tools Impresión',
    icon: BookOpen
  },
  {
    id: 'mosaico',
    sectionId: 'impresion',
    title: 'Imágenes a Mosaico A4',
    category: 'Tools Impresión',
    icon: LayoutGrid
  },
  {
    id: 'png',
    sectionId: 'impresion',
    title: 'PDF a Imagen PNG HD',
    category: 'Tools Impresión',
    icon: FileType
  },

  // Tools de Edición
  {
    id: 'editor-tarjetas',
    sectionId: 'editor-tarjetas',
    title: 'Editor Gráfico & Tarjetas',
    category: 'Tools de Edición',
    icon: CreditCard
  },
  {
    id: 'retouch-ia',
    sectionId: 'editor-tarjetas',
    title: 'Retoque IA & Quitar Fondo',
    category: 'Tools de Edición',
    icon: Wand2
  },

  // Tools Diseño
  {
    id: 'colour',
    sectionId: 'herramientas',
    title: 'Color OKLCH & Pantone®',
    category: 'Tools Diseño',
    icon: Palette
  },
  {
    id: 'type',
    sectionId: 'herramientas',
    title: 'Escala Tipográfica & Papel',
    category: 'Tools Diseño',
    icon: Ruler
  },
  {
    id: 'analysis',
    sectionId: 'herramientas',
    title: 'Paletas & Daltonismo',
    category: 'Tools Diseño',
    icon: ScanEye
  },
  {
    id: 'svg',
    sectionId: 'herramientas',
    title: 'Optimizador SVG & Marcas',
    category: 'Tools Diseño',
    icon: Code
  },
  {
    id: 'social',
    sectionId: 'herramientas',
    title: 'Social Cropper WebP',
    category: 'Tools Diseño',
    icon: Crop
  },
  {
    id: 'assets',
    sectionId: 'herramientas',
    title: 'Generador de Favicon',
    category: 'Tools Diseño',
    icon: FileImage
  },
  {
    id: 'cli',
    sectionId: 'herramientas',
    title: 'Comandos CLI Terminal',
    category: 'Tools Diseño',
    icon: Terminal
  },

  // Libro de Logos
  {
    id: 'logobook',
    sectionId: 'logobook',
    title: 'Libro de Logos (6.200+)',
    category: 'Catálogo',
    icon: BookOpen
  },

  // Educación
  {
    id: 'educacion',
    sectionId: 'educacion',
    title: 'Colección Mindy & Guías',
    category: 'Formación',
    icon: GraduationCap
  },

  // Comunidad
  {
    id: 'comunidad',
    sectionId: 'comunidad',
    title: 'Red de Diseñadores',
    category: 'Comunidad',
    icon: Users
  }
];
