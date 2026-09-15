import React from 'react';
import { cn } from '@/lib/utils';

export const Button = React.forwardRef(function Button({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:brightness-95',
    outline: 'border border-border bg-background hover:bg-muted',
    ghost: 'hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:brightness-95',
  };
  const sizes = { default: 'h-10 px-4 py-2', sm: 'h-9 px-3', lg: 'h-11 px-8', icon: 'h-10 w-10' };
  return <button ref={ref} type={type} className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50', variants[variant] || variants.default, sizes[size] || sizes.default, className)} {...props} />;
});
