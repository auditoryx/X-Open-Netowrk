import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'card-base';
  
  const variantClasses = {
    default: '',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    outline: 'border-2 border-gray-700 bg-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverClasses = hover ? 'card-hover' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Sub-components for better composition
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  title,
  description,
  action,
  children,
  ...props
}, ref) => (
  <div
    className={cn('flex items-start justify-between mb-6', className)}
    ref={ref}
    {...props}
  >
    <div className="flex-1 min-w-0">
      {title && (
        <h3 className="text-lg font-semibold text-white truncate">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-400 mt-1">
          {description}
        </p>
      )}
      {children}
    </div>
    {action && (
      <div className="flex-shrink-0 ml-4">
        {action}
      </div>
    )}
  </div>
));

CardHeader.displayName = 'CardHeader';

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    className={cn('text-gray-300', className)}
    ref={ref}
    {...props}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  align = 'left',
  children,
  ...props
}, ref) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center mt-6 pt-6 border-t border-gray-800',
        alignClasses[align],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
export default Card;
