import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'badge-base';
  
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5" />
      )}
      
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Status-specific badge variants for convenience
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'error' | 'success';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(({
  status,
  children,
  ...props
}, ref) => {
  const statusMap = {
    active: { variant: 'success' as const, children: children || 'Active' },
    inactive: { variant: 'neutral' as const, children: children || 'Inactive' },
    pending: { variant: 'warning' as const, children: children || 'Pending' },
    completed: { variant: 'success' as const, children: children || 'Completed' },
    cancelled: { variant: 'danger' as const, children: children || 'Cancelled' },
    error: { variant: 'danger' as const, children: children || 'Error' },
    success: { variant: 'success' as const, children: children || 'Success' },
  };

  const { variant, children: defaultChildren } = statusMap[status];

  return (
    <Badge
      variant={variant}
      dot
      ref={ref}
      {...props}
    >
      {defaultChildren}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export { Badge, StatusBadge };
export default Badge;
