// Monochromatic Design System for NeuroSpace Dashboard
// Black, white, and grays only with enhanced micro-interactions

export const designTokens = {
  // Monochromatic Colors
  colors: {
    // Primary colors
    primary: {
      black: '#000000',
      white: '#FFFFFF',
    },
    
    // Gray scale
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Semantic colors (minimal)
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    
    // Background colors
    background: {
      primary: 'bg-black',
      secondary: 'bg-gray-900',
      tertiary: 'bg-gray-800',
      card: 'bg-gray-900/50',
      glass: 'bg-gray-900/80 backdrop-blur-xl',
      overlay: 'bg-black/80',
    },
    
    // Border colors
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      accent: 'border-white/20',
      focus: 'border-white/40',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      muted: 'text-gray-500',
      accent: 'text-white/80',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400',
    }
  },

  // Enhanced Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    section: 'space-y-6',
    page: 'space-y-8',
    grid: 'gap-4',
    gridLg: 'gap-6',
  },

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Enhanced Shadows (monochromatic)
  shadows: {
    sm: 'shadow-sm shadow-black/10',
    md: 'shadow-md shadow-black/20',
    lg: 'shadow-lg shadow-black/30',
    xl: 'shadow-xl shadow-black/40',
    glow: 'shadow-lg shadow-white/10',
    inner: 'shadow-inner shadow-black/20',
  },

  // Enhanced Transitions & Animations
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
    transform: 'transform hover:scale-105',
    lift: 'transform hover:-translate-y-1',
    glow: 'hover:shadow-lg hover:shadow-white/10',
    border: 'hover:border-white/40',
  },

  // Micro-interactions
  interactions: {
    // Button interactions
    button: {
      hover: 'hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10',
      active: 'active:scale-95 active:translate-y-0',
      focus: 'focus:ring-2 focus:ring-white/40 focus:outline-none',
    },
    
    // Card interactions
    card: {
      hover: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10',
      active: 'active:scale-[0.98]',
      focus: 'focus:ring-2 focus:ring-white/20 focus:outline-none',
    },
    
    // Input interactions
    input: {
      focus: 'focus:ring-2 focus:ring-white/40 focus:border-white/40 focus:outline-none',
      hover: 'hover:border-white/30',
    },
    
    // Link interactions
    link: {
      hover: 'hover:text-white hover:scale-105',
      active: 'active:scale-95',
    }
  },

  // Typography
  typography: {
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    body: 'text-base leading-relaxed',
    small: 'text-sm leading-relaxed',
    caption: 'text-xs leading-relaxed',
  }
};

// Component-specific class combinations
export const componentClasses = {
  // Cards
  card: {
    base: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.card} ${designTokens.transitions.normal}`,
    hover: `${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    interactive: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.card} ${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    focus: `${designTokens.interactions.card.focus}`,
  },

  // Buttons
  button: {
    primary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} ${designTokens.colors.border.accent} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    secondary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.tertiary} ${designTokens.colors.border.primary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    ghost: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.secondary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    danger: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} ${designTokens.colors.text.error} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
  },

  // Inputs
  input: {
    base: `w-full ${designTokens.radius.md} ${designTokens.colors.border.secondary} ${designTokens.colors.background.tertiary} px-4 py-3 ${designTokens.colors.text.primary} placeholder:${designTokens.colors.text.muted} ${designTokens.interactions.input.focus} ${designTokens.interactions.input.hover} ${designTokens.transitions.normal}`,
  },

  // Icons
  icon: {
    container: `w-12 h-12 ${designTokens.radius.lg} ${designTokens.colors.background.primary} ${designTokens.colors.border.accent} flex items-center justify-center ${designTokens.transitions.normal} hover:scale-110`,
    small: `w-8 h-8 ${designTokens.radius.md} ${designTokens.colors.background.primary} ${designTokens.colors.border.accent} flex items-center justify-center ${designTokens.transitions.normal} hover:scale-110`,
  },

  // Status badges
  badge: {
    success: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} ${designTokens.colors.text.success} ${designTokens.transitions.normal}`,
    warning: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} ${designTokens.colors.text.warning} ${designTokens.transitions.normal}`,
    error: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} ${designTokens.colors.text.error} ${designTokens.transitions.normal}`,
    info: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} ${designTokens.colors.text.info} ${designTokens.transitions.normal}`,
  },

  // Layout
  layout: {
    page: `${designTokens.spacing.page}`,
    section: `${designTokens.spacing.section}`,
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${designTokens.spacing.gridLg}`,
    gridStats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${designTokens.spacing.gridLg}`,
  },

  // Loading states
  loading: {
    spinner: `animate-spin rounded-full border-2 border-gray-600 border-t-white`,
    pulse: `animate-pulse ${designTokens.colors.background.tertiary}`,
    skeleton: `animate-pulse ${designTokens.colors.background.tertiary} ${designTokens.radius.md}`,
  }
};

// Utility functions for consistent styling
export const getCardClass = (interactive = false, focusable = false) => {
  let classes = interactive ? componentClasses.card.interactive : componentClasses.card.base;
  if (focusable) classes += ` ${componentClasses.card.focus}`;
  return classes;
};

export const getButtonClass = (variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') => {
  return componentClasses.button[variant];
};

export const getInputClass = () => {
  return componentClasses.input.base;
};

export const getIconClass = (size: 'small' | 'medium' = 'medium') => {
  return size === 'small' ? componentClasses.icon.small : componentClasses.icon.container;
};

export const getBadgeClass = (status: 'success' | 'warning' | 'error' | 'info') => {
  return componentClasses.badge[status];
};

// Animation utilities
export const animations = {
  // Page transitions
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  
  // Micro-interactions
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  
  // Custom animations
  shimmer: 'animate-shimmer',
  float: 'animate-float',
  wiggle: 'animate-wiggle',
};