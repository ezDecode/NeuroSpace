// Monochromatic Design System for NeuroSpace Dashboard
// Black, white, and grays only with enhanced micro-interactions

export const designTokens = {
  // Color palette
  colors: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      900: '#312E81',
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
    
    // Success
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#22C55E',
      600: '#16A34A',
      900: '#14532D',
    },
    
    // Warning
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      900: '#78350F',
    },
    
    // Error
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      900: '#7F1D1D',
    },
    
    // Background colors for dark theme
    background: {
      primary: 'bg-white/5',
      secondary: 'bg-white/10',
      tertiary: 'bg-white/15',
      overlay: 'bg-black/80',
    },
    
    // Border colors
    border: {
      primary: 'border-white/10',
      secondary: 'border-white/20',
      accent: 'border-white/30',
      focus: 'border-white/40',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-white/80',
      tertiary: 'text-white/60',
      muted: 'text-white/40',
    }
  },

  // Typography
  typography: {
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    body: 'text-base leading-relaxed',
    small: 'text-sm leading-relaxed',
    caption: 'text-xs leading-relaxed',
  },

  // Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },

  // Border radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Transitions and animations
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
    slideRight: 'transform hover:translate-x-1',
    slideUp: 'transform hover:-translate-y-0.5',
    rotateSlightly: 'transform hover:rotate-1',
    glow: 'hover:shadow-lg hover:shadow-white/10',
    glowIntense: 'hover:shadow-xl hover:shadow-blue-500/20',
    border: 'hover:border-white/40',
    blur: 'hover:backdrop-blur-md',
    brighten: 'hover:brightness-110',
  },

  // Micro-interactions
  interactions: {
    // Button interactions
    button: {
      hover: 'hover:brightness-110 hover:shadow-lg hover:shadow-white/20 hover:border-white/30',
      active: 'active:brightness-95 active:shadow-inner',
      focus: 'focus:ring-2 focus:ring-white/40 focus:outline-none',
      slideGlow: 'hover:translate-x-0.5 hover:shadow-lg hover:shadow-blue-400/30',
    },

    // Card interactions
    card: {
      hover: 'hover:border-white/30 hover:shadow-xl hover:shadow-white/10 hover:backdrop-blur-sm',
      slideIn: 'hover:translate-x-1 hover:border-white/40',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30',
      focus: 'focus:ring-2 focus:ring-white/20 focus:outline-none',
      blur: 'hover:backdrop-blur-lg hover:bg-white/10',
    },

    // Input interactions
    input: {
      focus: 'focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:backdrop-blur-sm',
      hover: 'hover:border-white/40 hover:bg-white/10',
      glow: 'focus:shadow-lg focus:shadow-blue-400/20',
    },

    // Link interactions
    link: {
      hover: 'hover:text-white hover:translate-x-0.5',
      underline: 'hover:underline hover:decoration-2 hover:underline-offset-4',
      glow: 'hover:text-blue-300 hover:drop-shadow-sm',
    },

    // Icon interactions
    icon: {
      rotate: 'hover:rotate-12 hover:text-blue-300',
      bounce: 'hover:animate-bounce hover:text-white',
      spin: 'hover:rotate-180 hover:text-purple-300',
      pulse: 'hover:animate-pulse hover:text-green-300',
    }
  },

  // Layouts
  layouts: {
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid gap-6',
    flex: 'flex items-center justify-between',
  },

  // Components
  components: {
    // Buttons
    button: {
      primary: `px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/25`,
      secondary: `px-6 py-3 rounded-xl font-medium border border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:backdrop-blur-sm transition-all duration-300`,
      ghost: `px-4 py-2 rounded-lg font-medium text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-0.5 transition-all duration-300`,
    },

    // Cards
    card: {
      primary: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-white/5 transition-all duration-300`,
      interactive: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:translate-x-1 hover:border-white/30 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer`,
      glow: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300`,
    },

    // Inputs
    input: {
      primary: `w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:backdrop-blur-md hover:border-white/30 transition-all duration-300`,
    }
  },

  // Icons
  icon: {
    container: `w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:rotate-12 hover:border-white/30 hover:bg-white/10`,
    small: `w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:rotate-6 hover:border-white/20`,
  },

  // Effects
  effects: {
    glass: 'backdrop-blur-md bg-white/10 border border-white/20',
    glow: 'shadow-2xl shadow-blue-500/20',
    shine: 'bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] hover:bg-[position:100%_0%]',
  }
};

// Component-specific class combinations
export const componentClasses = {
  // Cards
  card: {
    base: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.primary} ${designTokens.transitions.normal}`,
    hover: `${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    interactive: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.primary} ${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    focus: `${designTokens.interactions.card.focus}`,
  },

  // Buttons
  button: {
    primary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} ${designTokens.colors.border.accent} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    secondary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.tertiary} ${designTokens.colors.border.primary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    ghost: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.secondary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    danger: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} text-red-400 ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
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
    success: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} text-green-400 ${designTokens.transitions.normal}`,
    warning: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} text-yellow-400 ${designTokens.transitions.normal}`,
    error: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} text-red-400 ${designTokens.transitions.normal}`,
          info: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} ${designTokens.colors.border.primary} text-blue-400 ${designTokens.transitions.normal}`,
  },

  // Layout
  layout: {
    page: `space-y-8`,
    section: `space-y-6`,
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,
    gridStats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`,
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