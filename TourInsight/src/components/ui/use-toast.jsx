import * as React from 'react';

const listeners = new Set();
let toasts = [];

function emit() { listeners.forEach((fn) => fn(toasts)); }

export function toast({ title, description, variant = 'default', duration = 4000 } = {}) {
  const id = globalThis.crypto?.randomUUID?.() || String(Date.now() + Math.random());
  toasts = [...toasts, { id, title, description, variant }].slice(-6);
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
  return {
    id,
    dismiss: () => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    },
  };
}

export function useToast() {
  const [state, setState] = React.useState(toasts);
  React.useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);
  return { toasts: state, toast };
}
