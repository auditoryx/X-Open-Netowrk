import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  animate?: boolean;
}

function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  animate = true,
  ...props
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-brutalist' : 'btn-brutalist-secondary';
  const sizeClass = size === 'sm' ? 'btn-brutalist-sm' : 
                   size === 'lg' ? 'btn-brutalist-lg' : '';
  
  const classes = [baseClass, sizeClass, className].filter(Boolean).join(' ');
  
  // Props without animate already extracted above
  const buttonProps = props;
  
  if (!animate) {
    return (
      <button className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }
  
  return (
    <motion.button 
      className={classes} 
      whileHover={{ 
        scale: 1.05,
        boxShadow: variant === 'primary' ? '6px 6px 0 #333333' : '6px 6px 0 #666666',
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
}

// Support both named and default exports
export { Button };
export default Button;