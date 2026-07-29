'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full py-3 px-3.5 text-sm transition-all duration-200 input-dark ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-red-500/60 bg-red-500/5 focus:border-red-500' : ''} ${className}`}
            style={{ color: 'var(--text-primary)' }}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            {hint}
          </p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
