import React, { createContext, useContext, useRef } from 'react';
import { cn } from '@/lib/utils';
const Ctx = createContext(null);
export function InputOTP({ maxLength = 6, value = '', onChange, children, className, ...props }) {
  const refs = useRef([]);
  const chars = Array.from({ length: maxLength }, (_, i) => value[i] || '');
  const setAt = (i, next) => {
    const digit = String(next || '').replace(/\D/g, '').slice(-1);
    const arr = [...chars]; arr[i] = digit;
    onChange?.(arr.join('').slice(0, maxLength));
    if (digit && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  const context = { chars, refs, setAt, onChange, maxLength, props };
  return <div className={cn('flex items-center justify-center', className)}><Ctx.Provider value={context}>{children}</Ctx.Provider></div>;
}
export function InputOTPGroup({ className, ...props }) { return <div className={cn('flex items-center', className)} {...props} />; }
export function InputOTPSlot({ index, className }) {
  const ctx = useContext(Ctx);
  return <input
    ref={(el) => { ctx.refs.current[index] = el; }}
    value={ctx.chars[index] || ''}
    inputMode="numeric"
    maxLength={1}
    autoComplete={index === 0 ? 'one-time-code' : 'off'}
    onChange={(e) => ctx.setAt(index, e.target.value)}
    onKeyDown={(e) => { if (e.key === 'Backspace' && !ctx.chars[index] && index > 0) ctx.refs.current[index - 1]?.focus(); }}
    className={cn('h-12 w-10 border border-input bg-background text-center text-lg outline-none first:rounded-l-md last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-ring', className)}
  />;
}
