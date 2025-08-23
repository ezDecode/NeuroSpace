// Design System Tokens for NeuroSpace Dashboard
// This file ensures consistent styling across all components

export const designTokens = {
  // Colors
  colors: {
    primary: {
      blue: 'from-blue-500 to-purple-600',
      blueHover: 'from-blue-600 to-purple-700',
      green: 'from-green-500 to-emerald-600',
      greenHover: 'from-green-600 to-emerald-700',
      purple: 'from-purple-500 to-pink-600',
      purpleHover: 'from-purple-600 to-pink-700',
      orange: 'from-orange-500 to-red-600',
      orangeHover: 'from-orange-600 to-red-700',
    },
    background: {
      primary: 'bg-black',
      secondary: 'bg-white/5',
      tertiary: 'bg-white/10',
      glass: 'bg-black/95 backdrop-blur-xl',
    },
    border: {
      primary: 'border-white/20',
      secondary: 'border-white/10',
      accent: 'border-blue-500/20',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-white/60',
      tertiary: 'text-white/40',
      accent: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    }
  },

  // Spacing
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

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    glow: 'hover:shadow-white/5',
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
    transform: 'transform hover:scale-[1.02]',
  },

  // Typography
  typography: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs',
  }
};

// Component-specific class combinations
export const componentClasses = {
  // Cards
  card: {
    base: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.secondary} ${designTokens.transitions.normal}`,
    hover: `${designTokens.colors.background.tertiary} ${designTokens.transitions.transform} ${designTokens.shadows.lg} ${designTokens.shadows.glow}`,
    interactive: `${designTokens.spacing.lg} ${designTokens.radius.lg} ${designTokens.colors.border.primary} ${designTokens.colors.background.secondary} hover:${designTokens.colors.background.tertiary} ${designTokens.transitions.normal} ${designTokens.transitions.transform} ${designTokens.shadows.lg} ${designTokens.shadows.glow}`,
  },

  // Buttons
  button: {
    primary: `px-6 py-3 ${designTokens.radius.md} bg-gradient-to-r ${designTokens.colors.primary.blue} ${designTokens.colors.text.primary} hover:${designTokens.colors.primary.blueHover} ${designTokens.transitions.normal} ${designTokens.transitions.transform} ${designTokens.shadows.md}`,
    secondary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.tertiary} ${designTokens.colors.border.primary} ${designTokens.colors.text.primary} hover:${designTokens.colors.background.secondary} ${designTokens.transitions.normal}`,
    ghost: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.secondary} ${designTokens.colors.text.primary} hover:${designTokens.colors.background.tertiary} ${designTokens.transitions.normal}`,
  },

  // Inputs
  input: {
    base: `w-full ${designTokens.radius.md} ${designTokens.colors.border.secondary} ${designTokens.colors.background.secondary} px-4 py-3 ${designTokens.colors.text.primary} placeholder:${designTokens.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-white/20`,
  },

  // Icons
  icon: {
    container: `w-12 h-12 ${designTokens.radius.lg} bg-gradient-to-br ${designTokens.colors.primary.blue} flex items-center justify-center`,
    small: `w-8 h-8 ${designTokens.radius.md} bg-gradient-to-br ${designTokens.colors.primary.blue} flex items-center justify-center`,
  },

  // Status badges
  badge: {
    success: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} bg-green-400/10 ${designTokens.colors.border.accent} border`,
    warning: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} bg-yellow-400/10 border-yellow-400/20 border`,
    error: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} bg-red-400/10 border-red-400/20 border`,
    info: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} bg-blue-400/10 ${designTokens.colors.border.accent} border`,
  },

  // Layout
  layout: {
    page: `${designTokens.spacing.page}`,
    section: `${designTokens.spacing.section}`,
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${designTokens.spacing.gridLg}`,
    gridStats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${designTokens.spacing.gridLg}`,
  }
};

// Utility functions for consistent styling
export const getGradientClass = (variant: 'blue' | 'green' | 'purple' | 'orange' = 'blue') => {
  return `bg-gradient-to-r ${designTokens.colors.primary[variant]}`;
};

export const getHoverGradientClass = (variant: 'blue' | 'green' | 'purple' | 'orange' = 'blue') => {
  return `hover:${designTokens.colors.primary[`${variant}Hover` as keyof typeof designTokens.colors.primary]}`;
};

export const getCardClass = (interactive = false) => {
  return interactive ? componentClasses.card.interactive : componentClasses.card.base;
};

export const getButtonClass = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  return componentClasses.button[variant];
};