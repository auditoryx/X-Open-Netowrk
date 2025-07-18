import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  mobileOptimized?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  mobileOptimized = true,
  children,
  disabled,
  ...props
}, ref) => {
  const baseClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    
    // Mobile optimizations
    mobileOptimized && [
      'touch-manipulation', // Improves touch responsiveness
      'select-none', // Prevents text selection on touch
      'active:scale-95', // Gentle press feedback
      'min-h-[2.75rem] mobile:min-h-[3rem]', // Ensures minimum touch target size
    ],
    
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled || loading,
    }
  );

  const variantClasses = {
    primary: cn(
      'bg-brand-600 text-white shadow-sm',
      'hover:bg-brand-700 focus-visible:ring-brand-500',
      'active:bg-brand-800'
    ),
    secondary: cn(
      'bg-gray-100 text-gray-900 shadow-sm',
      'hover:bg-gray-200 focus-visible:ring-gray-500',
      'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
    ),
    outline: cn(
      'border border-gray-300 bg-white text-gray-700 shadow-sm',
      'hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500',
      'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300',
      'dark:hover:bg-gray-800 dark:hover:border-gray-500'
    ),
    ghost: cn(
      'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
      'dark:text-gray-300 dark:hover:bg-gray-800'
    ),
    danger: cn(
      'bg-red-600 text-white shadow-sm',
      'hover:bg-red-700 focus-visible:ring-red-500',
      'active:bg-red-800'
    ),
    success: cn(
      'bg-green-600 text-white shadow-sm',
      'hover:bg-green-700 focus-visible:ring-green-500',
      'active:bg-green-800'
    ),
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  // Adjust size for mobile if mobileOptimized is true
  const responsiveSizeClasses = mobileOptimized ? {
    xs: 'px-3 py-2 mobile:px-4 mobile:py-2.5 text-xs mobile:text-sm gap-1.5',
    sm: 'px-4 py-2.5 mobile:px-5 mobile:py-3 text-sm mobile:text-base gap-2',
    md: 'px-5 py-3 mobile:px-6 mobile:py-3.5 text-base gap-2',
    lg: 'px-6 py-3.5 mobile:px-8 mobile:py-4 text-lg gap-2.5',
    xl: 'px-8 py-4 mobile:px-10 mobile:py-5 text-xl gap-3',
  } : sizeClasses;

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        responsiveSizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      
      <span className={cn(loading && leftIcon && 'ml-2')}>{children}</span>
      
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;
