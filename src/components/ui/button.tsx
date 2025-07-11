/**
 * Button Component
 */

'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  ...props
}) => {
  const base = 'px-4 py-2 rounded';
  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white'
      : variant === 'secondary'
      ? 'bg-gray-200 text-gray-800'
      : 'bg-white text-black border';

  return (
    <button className={`${base} ${variantClass}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
