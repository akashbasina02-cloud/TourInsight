import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl sm:p-8">
          <Link to="/" className="mb-7 block text-center font-heading text-xl font-semibold text-foreground">TourInsight</Link>
          <div className="mb-6 text-center">
            {Icon ? <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div> : null}
            <h1 className="font-heading text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
