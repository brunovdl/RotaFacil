'use client';

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'ghost';
  hover?: boolean;
}

const paddings = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const variants = {
  default: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  brand: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.08) 100%)',
    border: '1px solid rgba(124,58,237,0.3)',
  },
  success: {
    background: 'linear-gradient(135deg, rgba(16,217,160,0.12) 0%, rgba(5,150,105,0.06) 100%)',
    border: '1px solid rgba(16,217,160,0.25)',
  },
  warning: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.06) 100%)',
    border: '1px solid rgba(245,158,11,0.25)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.06)',
  },
};

export function Card({
  padding = 'md',
  variant = 'default',
  hover = false,
  className = '',
  style,
  children,
  ...props
}: CardProps) {
  const v = variants[variant];

  return (
    <div
      className={`rounded-2xl ${paddings[padding]} ${hover ? 'hover-lift cursor-pointer' : ''} ${className}`}
      style={{
        background: v.background,
        border: v.border,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
