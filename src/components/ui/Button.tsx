import React from 'react';
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}
export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none';
  const variants = {
    primary:  'bg-brand text-white hover:bg-brand-dark',
    secondary:'border border-brand text-brand hover:bg-brand/10',
    ghost:    'text-brand hover:bg-brand/10',
  }[variant];
  return <button {...props} className={`${base} ${variants} ${className}`} />;
}
