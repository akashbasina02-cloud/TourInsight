import React from 'react';
import { useToast } from '@/components/ui/use-toast';
export function Toaster() {
  const { toasts } = useToast();
  return <div className="fixed right-4 top-4 z-[200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
    {toasts.map((t) => <div key={t.id} className={`rounded-xl border bg-card p-4 text-card-foreground shadow-xl ${t.variant === 'destructive' ? 'border-destructive/50' : 'border-border'}`}>
      {t.title && <div className="font-medium">{t.title}</div>}
      {t.description && <div className="mt-1 text-sm text-muted-foreground">{t.description}</div>}
    </div>)}
  </div>;
}
