import React from 'react';
import { Link } from 'react-router-dom';
export default function UserNotRegisteredError() {
  return <div className="grid min-h-screen place-items-center px-4"><div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
    <h1 className="font-heading text-2xl font-semibold">Access restricted</h1>
    <p className="mt-3 text-sm text-muted-foreground">Your sign-in was recognized, but this account is not registered for the application yet.</p>
    <Link to="/register" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Create an account</Link>
  </div></div>;
}
