'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

interface ButtonAsButtonProps extends BaseButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  href?: never;
  target?: never;
  rel?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  as: 'a';
  href: string;
}

interface ButtonAsNextLinkProps extends BaseButtonProps {
  as: 'next-link';
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsNextLinkProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      'aria-label': ariaLabel,
      ...rest
    } = props;

    const disabled = isDisabled || isLoading;
    
    // Common classes shared between button and link
    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-900',
      // Variant-specific styles
      {
        // Primary button
        'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800 dark:disabled:bg-blue-800/50':
          variant === 'primary',
        // Secondary button
        'bg-gray-100 text-gray-800 shadow-sm hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500':
          variant === 'secondary',
        // Outline button
        'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:disabled:text-gray-500 dark:disabled:border-gray-700':
          variant === 'outline',
        // Ghost button
        'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:disabled:text-gray-500':
          variant === 'ghost',
        // Destructive button
        'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:active:bg-red-800 dark:disabled:bg-red-800/50': 
          variant === 'destructive',
        // Success button
        'bg-green-600 text-white shadow-sm hover:bg-green-700 active:bg-green-800 disabled:bg-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:active:bg-green-800 dark:disabled:bg-green-800/50': 
          variant === 'success',
        // Warning button
        'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300 dark:bg-amber-600 dark:hover:bg-amber-700 dark:active:bg-amber-800 dark:disabled:bg-amber-800/50': 
          variant === 'warning',
      },
      // Size-specific styles
      {
        'text-xs px-2 py-1 rounded': size === 'xs',
        'text-sm px-3 py-1.5 rounded': size === 'sm',
        'text-base px-4 py-2 rounded-md': size === 'md',
        'text-lg px-6 py-3 rounded-lg': size === 'lg',
        'text-xl px-8 py-4 rounded-lg': size === 'xl',
      },
      // Width
      fullWidth && 'w-full',
      // Disabled state
      disabled && 'cursor-not-allowed opacity-60',
      // Custom classes
      className
    );

    // If the button is a Next.js Link
    if (props.as === 'next-link') {
      const { as, href, isLoading, isDisabled, fullWidth, variant, size, leftIcon, rightIcon, ...linkProps } = props;
      return (
        <Link 
          href={href} 
          className={baseClasses} 
          aria-label={ariaLabel} 
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          {...linkProps}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {renderButtonChildren()}
        </Link>
      );
    }
    
    // If the button is a regular anchor tag
    if (props.as === 'a') {
      const { as, href, isLoading, isDisabled, fullWidth, variant, size, leftIcon, rightIcon, ...linkProps } = props;
      return (
        <a 
          href={href} 
          className={baseClasses} 
          aria-label={ariaLabel} 
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          {...linkProps}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        >
          {renderButtonChildren()}
        </a>
      );
    }

    // Default is a button element
    const { as, ...buttonProps } = props;
    return (
      <button
        className={baseClasses}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        type={buttonProps.type || 'button'}
        {...buttonProps}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
      >
        {renderButtonChildren()}
      </button>
    );

    function renderButtonChildren() {
      return (
        <>
          {isLoading && (
            <span className="mr-2 flex" aria-hidden="true">
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
          {leftIcon && !isLoading && <span className="mr-2 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
        </>
      );
    }
  }
); 