import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-brutalist' : 'btn-brutalist-secondary';
  const sizeClass = size === 'sm' ? 'btn-brutalist-sm' : 
                   size === 'lg' ? 'btn-brutalist-lg' : '';
  
  const classes = [baseClass, sizeClass, className].filter(Boolean).join(' ');
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}