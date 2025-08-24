// Monochromatic Design System for NeuroSpace Dashboard
// Black, white, and grays only with enhanced micro-interactions

// Type definitions
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconSize = 'small' | 'medium';
export type BadgeStatus = 'success' | 'warning' | 'error' | 'info';

// Additional utility types for better type safety
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type SemanticColors = {
  success: string;
  warning: string;
  error: string;
  info: string;
};

export type PrimaryColors = {
  black: string;
  white: string;
};

export type BackgroundClasses = {
  primary: string;
  secondary: string;
  tertiary: string;
  card: string;
  glass: string;
  overlay: string;
};

export type BorderClasses = {
  primary: string;
  secondary: string;
  accent: string;
  focus: string;
};

export type TextClasses = {
  primary: string;
  secondary: string;
  tertiary: string;
  muted: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
};

export const designTokens = {
  // Monochromatic Colors
  colors: {
    // Primary colors
    primary: {
      black: '#000000',
      white: '#FFFFFF',
    } as const satisfies PrimaryColors,
    
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
    } as const satisfies ColorScale,
    
    // Semantic colors (minimal)
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    } as const satisfies SemanticColors,
    
    // Background colors
    background: {
      primary: 'bg-black',
      secondary: 'bg-gray-900',
      tertiary: 'bg-gray-800',
      card: 'bg-gray-900/50',
      glass: 'bg-gray-900/80 backdrop-blur-xl',
      overlay: 'bg-black/80',
    } as const satisfies BackgroundClasses,
    
    // Border colors
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      accent: 'border-white/20',
      focus: 'border-white/40',
    } as const satisfies BorderClasses,
    
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
    } as const satisfies TextClasses
  } as const,

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
  } as const,

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  } as const,

  // Enhanced Shadows (monochromatic)
  shadows: {
    sm: 'shadow-sm shadow-black/10',
    md: 'shadow-md shadow-black/20',
    lg: 'shadow-lg shadow-black/30',
    xl: 'shadow-xl shadow-black/40',
    glow: 'shadow-lg shadow-white/10',
    inner: 'shadow-inner shadow-black/20',
  } as const,

  // Enhanced Transitions & Animations
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
    transform: 'transform hover:scale-105',
    lift: 'transform hover:-translate-y-1',
    glow: 'hover:shadow-lg hover:shadow-white/10',
    border: 'hover:border-white/40',
  } as const,

  // Micro-interactions
  interactions: {
    // Button interactions
    button: {
      hover: 'hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10',
      active: 'active:scale-95 active:translate-y-0',
      focus: 'focus:ring-2 focus:ring-white/40 focus:outline-none',
    } as const,
    
    // Card interactions
    card: {
      hover: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10',
      active: 'active:scale-[0.98]',
      focus: 'focus:ring-2 focus:ring-white/20 focus:outline-none',
    } as const,
    
    // Input interactions
    input: {
      focus: 'focus:ring-2 focus:ring-white/40 focus:border-white/40 focus:outline-none',
      hover: 'hover:border-white/30',
    } as const,
    
    // Link interactions
    link: {
      hover: 'hover:text-white hover:scale-105',
      active: 'active:scale-95',
    } as const
  } as const,

  // Typography
  typography: {
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    body: 'text-base leading-relaxed',
    small: 'text-sm leading-relaxed',
    caption: 'text-xs leading-relaxed',
  } as const
} as const;

// Component-specific class combinations with type safety
export const componentClasses = {
  // Cards
  card: {
    base: `${designTokens.spacing.lg} ${designTokens.radius.lg} border ${designTokens.colors.border.primary} ${designTokens.colors.background.card} ${designTokens.transitions.normal}`,
    hover: `${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    interactive: `${designTokens.spacing.lg} ${designTokens.radius.lg} border ${designTokens.colors.border.primary} ${designTokens.colors.background.card} ${designTokens.interactions.card.hover} ${designTokens.transitions.normal}`,
    focus: `${designTokens.interactions.card.focus}`,
  } as const,

  // Buttons
  button: {
    primary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} border ${designTokens.colors.border.accent} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    secondary: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.tertiary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    ghost: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.secondary} ${designTokens.colors.text.primary} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
    danger: `px-6 py-3 ${designTokens.radius.md} ${designTokens.colors.background.primary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.error} ${designTokens.interactions.button.hover} ${designTokens.interactions.button.active} ${designTokens.interactions.button.focus} ${designTokens.transitions.normal}`,
  } as const,

  // Inputs
  input: {
    base: `w-full ${designTokens.radius.md} border ${designTokens.colors.border.secondary} ${designTokens.colors.background.tertiary} px-4 py-3 ${designTokens.colors.text.primary} placeholder:${designTokens.colors.text.muted} ${designTokens.interactions.input.focus} ${designTokens.interactions.input.hover} ${designTokens.transitions.normal}`,
  } as const,

  // Icons
  icon: {
    container: `w-12 h-12 ${designTokens.radius.lg} ${designTokens.colors.background.primary} border ${designTokens.colors.border.accent} flex items-center justify-center ${designTokens.transitions.normal} hover:scale-110`,
    small: `w-8 h-8 ${designTokens.radius.md} ${designTokens.colors.background.primary} border ${designTokens.colors.border.accent} flex items-center justify-center ${designTokens.transitions.normal} hover:scale-110`,
  } as const,

  // Status badges
  badge: {
    success: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.success} ${designTokens.transitions.normal}`,
    warning: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.warning} ${designTokens.transitions.normal}`,
    error: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.error} ${designTokens.transitions.normal}`,
    info: `inline-flex items-center space-x-2 px-3 py-1 ${designTokens.radius.full} ${designTokens.colors.background.primary} border ${designTokens.colors.border.primary} ${designTokens.colors.text.info} ${designTokens.transitions.normal}`,
  } as const,

  // Layout
  layout: {
    page: `${designTokens.spacing.page}`,
    section: `${designTokens.spacing.section}`,
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${designTokens.spacing.gridLg}`,
    gridStats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${designTokens.spacing.gridLg}`,
  } as const,

  // Loading states
  loading: {
    spinner: `animate-spin rounded-full border-2 border-gray-600 border-t-white`,
    pulse: `animate-pulse ${designTokens.colors.background.tertiary}`,
    skeleton: `animate-pulse ${designTokens.colors.background.tertiary} ${designTokens.radius.md}`,
  } as const
} as const;

// Utility functions for consistent styling with proper TypeScript types
export const getCardClass = (interactive: boolean = false, focusable: boolean = false): string => {
  let classes = interactive ? componentClasses.card.interactive : componentClasses.card.base;
  if (focusable) {
    classes += ` ${componentClasses.card.focus}`;
  }
  return classes;
};

export const getButtonClass = (variant: ButtonVariant = 'primary'): string => {
  const buttonClass = componentClasses.button[variant];
  if (!buttonClass) {
    console.warn(`Invalid button variant: ${variant}. Falling back to 'primary'.`);
    return componentClasses.button.primary;
  }
  return buttonClass;
};

export const getInputClass = (): string => {
  return componentClasses.input.base;
};

export const getIconClass = (size: IconSize = 'medium'): string => {
  if (size === 'small') {
    return componentClasses.icon.small;
  }
  return componentClasses.icon.container;
};

export const getBadgeClass = (status: BadgeStatus): string => {
  const badgeClass = componentClasses.badge[status];
  if (!badgeClass) {
    console.warn(`Invalid badge status: ${status}. Falling back to 'info'.`);
    return componentClasses.badge.info;
  }
  return badgeClass;
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
} as const;

// Additional type exports for external usage
export type DesignTokens = typeof designTokens;
export type ComponentClasses = typeof componentClasses;
export type Animations = typeof animations;

// Derived types for better IntelliSense
export type ButtonVariants = keyof typeof componentClasses.button;
export type BadgeStatuses = keyof typeof componentClasses.badge;
export type IconSizes = keyof typeof componentClasses.icon;
export type LayoutClasses = keyof typeof componentClasses.layout;

// Color palette types for external usage
export type GrayShade = keyof typeof designTokens.colors.gray;
export type BackgroundType = keyof typeof designTokens.colors.background;
export type BorderType = keyof typeof designTokens.colors.border;
export type TextType = keyof typeof designTokens.colors.text;

// Utility function types
export type GetCardClassFn = typeof getCardClass;
export type GetButtonClassFn = typeof getButtonClass;
export type GetInputClassFn = typeof getInputClass;
export type GetIconClassFn = typeof getIconClass;
export type GetBadgeClassFn = typeof getBadgeClass;