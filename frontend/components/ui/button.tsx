'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { SpinnerIcon } from './icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    border: 'none',
  },
  secondary: {
    background: 'rgba(255,255,255,0.07)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  outline: {
    background: 'transparent',
    color: '#A78BFA',
    border: '1px solid rgba(124,58,237,0.5)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
    border: 'none',
  },
  success: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(16,217,160,0.25)',
    border: 'none',
  },
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-3 text-sm rounded-2xl',
  lg: 'px-6 py-4 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      className = '',
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const variantStyle = variants[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 press-effect disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${sizes[size]} ${className}`}
        style={{
          ...variantStyle,
          ...(variant === 'primary' && !disabled && !loading
            ? { /* hover handled by press-effect */ }
            : {}),
          ...style,
        }}
        {...props}
      >
        {loading && <SpinnerIcon size={16} className="mr-2 -ml-1" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
