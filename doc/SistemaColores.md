# **Sistema de Colores - Plataforma Family School Connect**

## **Archivo `index.css` - Variables de Color**

```css
@import "tailwindcss";

:root {
  --font-sans: 'Poppins', sans-serif;
}

@theme {
  /* ============================================
   * COLORES PRIMARIOS - Púrpura/Violeta Principal
   * Usado para: Sidebar, navegación activa, botones primarios
   * ============================================ */
  --color-primary-50: #f3f1ff;    /* Fondo hover en navegación */
  --color-primary-100: #e9e5ff;   /* Fondo activo en navegación */
  --color-primary-200: #d4ccff;   /* Bordes y divisores */
  --color-primary-300: #b5a7ff;   /* Elementos secundarios activos */
  --color-primary-400: #9b8aff;   /* Botones secundarios */
  --color-primary-500: #8b71ff;   /* Color principal de la marca */
  --color-primary-600: #7c5cff;   /* Estados hover de botones */
  --color-primary-700: #6d47ff;   /* Estados active/pressed */
  --color-primary-800: #5e38cc;   /* Texto sobre fondos claros */
  --color-primary-900: #4e2d99;   /* Fondo del sidebar principal */

  /* ============================================
   * COLORES SECUNDARIOS - Naranja/Coral
   * Usado para: Alertas, notificaciones, CTAs importantes
   * ============================================ */
  --color-secondary-50: #fff7ed;   
  --color-secondary-100: #ffedd5;  
  --color-secondary-200: #fed7aa;  
  --color-secondary-300: #fdba74;  
  --color-secondary-400: #fb923c;  
  --color-secondary-500: #f97316;  
  --color-secondary-600: #ea580c;  
  --color-secondary-700: #c2410c;  
  --color-secondary-800: #9a3412;  
  --color-secondary-900: #7c2d12;  

  /* ============================================
   * COLORES TERCIARIOS - Teal/Verde Azulado
   * Usado para: Confirmaciones, estados exitosos
   * ============================================ */
  --color-tertiary-50: #f0fdfa;    
  --color-tertiary-100: #ccfbf1;   
  --color-tertiary-200: #99f6e4;   
  --color-tertiary-300: #5eead4;   
  --color-tertiary-400: #2dd4bf;   
  --color-tertiary-500: #14b8a6;   
  --color-tertiary-600: #0d9488;   
  --color-tertiary-700: #0f766e;   
  --color-tertiary-800: #115e59;   
  --color-tertiary-900: #134e4a;   

  /* ============================================
   * BACKGROUNDS - Fondos del Sistema
   * DISTRIBUCIÓN CORREGIDA:
   * - Sidebar: Púrpura oscuro (primary-900)
   * - Header: Blanco puro
   * - App/Body: Gris muy claro
   * - Cards: Blanco puro
   * ============================================ */
  --color-bg-app: #f8f9fc;         /* Fondo principal (gris muy claro) */
  --color-bg-main: #ffffff;        /* Contenedores principales (blanco) */
  --color-bg-card: #ffffff;        /* Cards (blanco) */
  --color-bg-sidebar: #4e2d99;     /* Sidebar (primary-900 - púrpura oscuro) */
  --color-bg-hover-table: #e9e5ff;     /* Sidebar (primary-900 - púrpura oscuro) */
  --color-bg-header: #ffffff;      /* Header (blanco) */
  --color-bg-overlay: #000000b3;   /* Overlay para modales */
  --color-bg-disabled: #f1f5f9;    /* Elementos deshabilitados */

  /* ============================================
   * BACKGROUNDS DARK MODE
   * ============================================ */
  --color-bg-dark-app: #0f1419;    
  --color-bg-dark-main: #1a202c;   
  --color-bg-dark-card: #2d3748;   
  --color-bg-dark-sidebar: #1a1f2e;

  /* ============================================
   * TEXTOS - Jerarquía Tipográfica
   * ============================================ */
  --color-text-primary: #1a202c;   /* Títulos principales */
  --color-text-secondary: #4a5568; /* Texto regular */
  --color-text-muted: #718096;     /* Texto secundario */
  --color-text-placeholder: #a0aec0; 
  --color-text-disabled: #cbd5e0;  
  --color-text-white: #ffffff;     /* Texto sobre fondos oscuros */
  --color-text-inverse: #ffffff;   /* Texto sobre sidebar púrpura */

  /* ============================================
   * ESTADOS DEL SISTEMA - Feedback Visual
   * ============================================ */
  --color-success: #10b981;        
  --color-success-light: #d1fae5;  
  --color-success-dark: #047857;   

  --color-warning: #f59e0b;        
  --color-warning-light: #fef3c7;  
  --color-warning-dark: #d97706;   

  --color-error: #ef4444;          
  --color-error-light: #fef2f2;    
  --color-error-dark: #dc2626;     

  --color-info: #3b82f6;           
  --color-info-light: #dbeafe;     
  --color-info-dark: #1d4ed8;      

  /* ============================================
   * BORDERS - Bordes y Divisores
   * ============================================ */
  --color-border-primary: #e5e7eb; /* Bordes principales (gris claro) */
  --color-border-secondary: #f3f4f6; 
  --color-border-light: #f9fafb;   
  --color-border-focus: #8b71ff;   
  --color-border-error: #ef4444;   
  --color-border-success: #10b981; 

  /* ============================================
   * NAVEGACIÓN - Elementos del Sidebar
   * IMPORTANTE: Colores sobre fondo púrpura oscuro
   * ============================================ */
  --color-nav-item: #e9e5ff;       /* Texto items normales (púrpura claro) */
  --color-header-item: #1a202c;       /* Texto items normales (púrpura claro) */
  --color-nav-item-hover: #ffffff; /* Texto en hover (blanco) */
  --color-nav-item-active: #ffffff; /* Texto item activo (blanco) */
  --color-nav-item-active-bg: #6d47ff; /* Fondo item activo (primary-700) */
  --color-nav-item-hover-bg: #5e38cc; /* Fondo hover (primary-800) */

  /* ============================================
   * ACADÉMICO - Colores Específicos del Dominio
   * ============================================ */
  --color-academic-excellent: #10b981; 
  --color-academic-good: #3b82f6;      
  --color-academic-regular: #f59e0b;   
  --color-academic-poor: #ef4444;      

  --color-attendance-present: #10b981;    
  --color-attendance-late: #f59e0b;       
  --color-attendance-excuse: #3b82f6;     
  --color-attendance-justified: #8b5cf6;  
  --color-attendance-unjustified: #ef4444;

  /* ============================================
   * SOMBRAS - Depth y Elevación
   * ============================================ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);      
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);     
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);   
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);   

  /* ============================================
   * ROLES - Colores por Tipo de Usuario
   * ============================================ */
  --color-role-padre: #8b71ff;     
  --color-role-docente: #14b8a6;   
  --color-role-director: #f97316;  
  --color-role-admin: #6b7280;     
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

