'use client';

import React, { ButtonHTMLAttributes, forwardRef, ReactElement } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'goldOutline' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', className = '', children, ...props },
    ref
  ): ReactElement {
    const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
    
    const variantStyles = {
      primary: 'bg-[#122a26] text-white hover:bg-[#0f221f] focus:ring-[#122a26]',
      secondary: 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      outline: 'bg-transparent text-gray-900 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
      icon: 'rounded-lg border-2 border-gray-200 text-gray-700 hover:border-[#dcc090]/60 hover:bg-[#dcc090]/5 focus:ring-[#dcc090]',
    };
    
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'w-10 h-10 p-0 shrink-0',
    };
    
    const isIcon = variant === 'icon' || size === 'icon';
    const effectiveSize = isIcon ? 'icon' : size;
    const goldOutlineClasses = 'bg-transparent border-2 border-[#dcc090] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 focus:ring-[#dcc090]';
    
    const variantClass = variant === 'goldOutline' ? goldOutlineClasses : variantStyles[variant];
    const sizeClass = sizeStyles[effectiveSize as keyof typeof sizeStyles];
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

