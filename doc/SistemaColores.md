# **Sistema de Colores - Plataforma Family School Connect**

## **Archivo `index.css` - Variables de Color**

```css
@theme {
  /* ============================================
   * COLORES PRIMARIOS - Púrpura/Violeta Principal
   * Usado para: Headers, navegación principal, botones primarios
   * ============================================ */
  --color-primary-50: #f3f1ff;    /* Fondo muy claro para cards y overlays */
  --color-primary-100: #e9e5ff;   /* Fondo claro para estados hover ligeros */
  --color-primary-200: #d4ccff;   /* Bordes y divisores principales */
  --color-primary-300: #b5a7ff;   /* Elementos secundarios activos */
  --color-primary-400: #9b8aff;   /* Botones secundarios */
  --color-primary-500: #8b71ff;   /* Color principal de la marca */
  --color-primary-600: #7c5cff;   /* Estados hover de botones primarios */
  --color-primary-700: #6d47ff;   /* Estados active/pressed */
  --color-primary-800: #5e38cc;   /* Texto sobre fondos claros */
  --color-primary-900: #4e2d99;   /* Texto de alta prioridad */

  /* ============================================
   * COLORES SECUNDARIOS - Naranja/Coral
   * Usado para: Alertas, notificaciones, CTAs importantes
   * ============================================ */
  --color-secondary-50: #fff7ed;   /* Fondo para alertas informativas */
  --color-secondary-100: #ffedd5;  /* Fondo hover para elementos naranja */
  --color-secondary-200: #fed7aa;  /* Bordes de elementos secundarios */
  --color-secondary-300: #fdba74;  /* Elementos decorativos */
  --color-secondary-400: #fb923c;  /* Botones de alerta media */
  --color-secondary-500: #f97316;  /* Color secundario principal */
  --color-secondary-600: #ea580c;  /* Hover para botones secundarios */
  --color-secondary-700: #c2410c;  /* Estados active secundarios */
  --color-secondary-800: #9a3412;  /* Texto sobre fondos claros */
  --color-secondary-900: #7c2d12;  /* Texto de alta importancia */

  /* ============================================
   * COLORES TERCIARIOS - Teal/Verde Azulado
   * Usado para: Confirmaciones, estados exitosos, elementos informativos
   * ============================================ */
  --color-tertiary-50: #f0fdfa;    /* Fondo para mensajes exitosos */
  --color-tertiary-100: #ccfbf1;   /* Hover ligero para elementos teal */
  --color-tertiary-200: #99f6e4;   /* Bordes de elementos informativos */
  --color-tertiary-300: #5eead4;   /* Elementos decorativos informativos */
  --color-tertiary-400: #2dd4bf;   /* Botones informativos */
  --color-tertiary-500: #14b8a6;   /* Color terciario principal */
  --color-tertiary-600: #0d9488;   /* Hover para elementos informativos */
  --color-tertiary-700: #0f766e;   /* Estados active informativos */
  --color-tertiary-800: #115e59;   /* Texto sobre fondos claros */
  --color-tertiary-900: #134e4a;   /* Texto informativo fuerte */

  /* ============================================
   * BACKGROUNDS - Fondos del Sistema
   * Usado para: Layouts, containers, cards, modales
   * ============================================ */
  --color-bg-app: #fafbfc;         /* Fondo principal de la aplicación */
  --color-bg-main: #ffffff;        /* Fondo de contenedores principales */
  --color-bg-card: #ffffff;        /* Fondo de tarjetas y cards */
  --color-bg-sidebar: #f8f9fb;     /* Fondo de sidebar y navegación lateral */
  --color-bg-header: #ffffff;      /* Fondo del header principal */
  --color-bg-overlay: #000000b3;   /* Overlay para modales (negro 70% opacidad) */
  --color-bg-disabled: #f1f5f9;    /* Fondo para elementos deshabilitados */

  /* ============================================
   * BACKGROUNDS DARK MODE
   * Usado para: Tema oscuro opcional
   * ============================================ */
  --color-bg-dark-app: #0f1419;    /* Fondo principal modo oscuro */
  --color-bg-dark-main: #1a202c;   /* Contenedores principales oscuro */
  --color-bg-dark-card: #2d3748;   /* Cards en modo oscuro */
  --color-bg-dark-sidebar: #1a1f2e; /* Sidebar modo oscuro */

  /* ============================================
   * TEXTOS - Jerarquía Tipográfica
   * Usado para: Títulos, párrafos, labels, placeholders
   * ============================================ */
  --color-text-primary: #1a202c;   /* Títulos principales y texto importante */
  --color-text-secondary: #4a5568; /* Texto de párrafos y contenido regular */
  --color-text-muted: #718096;     /* Texto secundario, labels, metadata */
  --color-text-placeholder: #a0aec0; /* Placeholders de inputs */
  --color-text-disabled: #cbd5e0;  /* Texto deshabilitado */
  --color-text-white: #ffffff;     /* Texto sobre fondos oscuros */
  --color-text-inverse: #ffffff;   /* Texto sobre fondos colorados */

  /* ============================================
   * ESTADOS DEL SISTEMA - Feedback Visual
   * Usado para: Alertas, notificaciones, validaciones
   * ============================================ */
  --color-success: #10b981;        /* Operaciones exitosas, confirmaciones */
  --color-success-light: #d1fae5;  /* Fondo para alertas de éxito */
  --color-success-dark: #047857;   /* Texto/íconos de éxito */

  --color-warning: #f59e0b;        /* Advertencias, alertas moderadas */
  --color-warning-light: #fef3c7;  /* Fondo para alertas de advertencia */
  --color-warning-dark: #d97706;   /* Texto/íconos de advertencia */

  --color-error: #ef4444;          /* Errores, validaciones fallidas */
  --color-error-light: #fef2f2;    /* Fondo para alertas de error */
  --color-error-dark: #dc2626;     /* Texto/íconos de error */

  --color-info: #3b82f6;           /* Información general, tips */
  --color-info-light: #dbeafe;     /* Fondo para alertas informativas */
  --color-info-dark: #1d4ed8;      /* Texto/íconos informativos */

  /* ============================================
   * BORDERS - Bordes y Divisores
   * Usado para: Separadores, inputs, cards
   * ============================================ */
  --color-border-primary: #e2e8f0; /* Bordes principales de elementos */
  --color-border-secondary: #edf2f7; /* Bordes más sutiles */
  --color-border-light: #f7fafc;   /* Bordes muy sutiles, divisores */
  --color-border-focus: #8b71ff;   /* Bordes de elementos enfocados */
  --color-border-error: #ef4444;   /* Bordes de inputs con error */
  --color-border-success: #10b981; /* Bordes de inputs válidos */

  /* ============================================
   * NAVEGACIÓN - Elementos Interactivos
   * Usado para: Menús, enlaces, breadcrumbs
   * ============================================ */
  --color-nav-item: #4a5568;       /* Items de navegación normales */
  --color-nav-item-hover: #2d3748; /* Hover en items de navegación */
  --color-nav-item-active: #8b71ff; /* Item activo en navegación */
  --color-nav-item-active-bg: #f3f1ff; /* Fondo de item activo */

  /* ============================================
   * ACADÉMICO - Colores Específicos del Dominio
   * Usado para: Calificaciones, asistencia, estados académicos
   * ============================================ */
  --color-academic-excellent: #10b981; /* Notas AD (18-20) */
  --color-academic-good: #3b82f6;      /* Notas A (14-17) */
  --color-academic-regular: #f59e0b;   /* Notas B (11-13) */
  --color-academic-poor: #ef4444;      /* Notas C (0-10) */

  --color-attendance-present: #10b981;    /* Asistencia presente */
  --color-attendance-late: #f59e0b;       /* Tardanza */
  --color-attendance-excuse: #3b82f6;     /* Permiso */
  --color-attendance-justified: #8b5cf6;  /* Falta justificada */
  --color-attendance-unjustified: #ef4444; /* Falta injustificada */

  /* ============================================
   * SOMBRAS - Depth y Elevación
   * Usado para: Cards, modales, dropdowns
   * ============================================ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);      /* Sombra sutil */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);     /* Sombra media para cards */
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);   /* Sombra pronunciada */
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);   /* Sombra para modales */

  /* ============================================
   * ROLES - Colores por Tipo de Usuario
   * Usado para: Identificación visual de roles
   * ============================================ */
  --color-role-padre: #8b71ff;     /* Color identificativo padres */
  --color-role-docente: #14b8a6;   /* Color identificativo docentes */
  --color-role-director: #f97316;  /* Color identificativo director */
  --color-role-admin: #6b7280;     /* Color identificativo administrador */
}

```

## **Guía de Uso por Componente**

### **Headers y Navegación Principal**
- Fondo: `bg-primary-600` o `bg-primary-700`
- Texto: `text-white`
- Enlaces hover: `hover:bg-primary-800`

### **Sidebar/Menú Lateral**
- Fondo: `bg-bg-sidebar`
- Items activos: `bg-primary-100` con `text-primary-700`
- Items hover: `hover:bg-primary-50`

### **Cards y Containers**
- Fondo: `bg-bg-card`
- Borde: `border-border-primary`
- Sombra: `shadow-md`

### **Botones**
- **Primarios**: `bg-primary-600 hover:bg-primary-700 text-white`
- **Secundarios**: `bg-secondary-500 hover:bg-secondary-600 text-white`
- **Informativos**: `bg-tertiary-500 hover:bg-tertiary-600 text-white`

### **Estados Académicos**
- **Excelente (AD)**: `text-academic-excellent`
- **Bueno (A)**: `text-academic-good`
- **Regular (B)**: `text-academic-regular`
- **Deficiente (C)**: `text-academic-poor`

### **Asistencia**
- **Presente**: `bg-attendance-present`
- **Tardanza**: `bg-attendance-late`
- **Permiso**: `bg-attendance-excuse`
- **Falta Justificada**: `bg-attendance-justified`
- **Falta Injustificada**: `bg-attendance-unjustified`

### **Alertas y Notificaciones**
- **Éxito**: `bg-success-light border-success text-success-dark`
- **Advertencia**: `bg-warning-light border-warning text-warning-dark`
- **Error**: `bg-error-light border-error text-error-dark`
- **Info**: `bg-info-light border-info text-info-dark`

