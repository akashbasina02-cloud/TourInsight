import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, UserRound } from 'lucide-react';
import { appClient } from '@/api/appClient';

export default function TopNav() {
  const [authed, setAuthed] = useState(null);
  useEffect(() => { let alive = true; appClient.auth.isAuthenticated().then((v) => alive && setAuthed(v)).catch(() => alive && setAuthed(false)); return () => { alive = false; }; }, []);
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[#12203A]/95 text-white backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <Link to="/" className="font-heading text-xl font-semibold tracking-tight">TourInsight</Link>
      <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider sm:gap-4">
        <Link to="/#planner" className="hidden text-white/75 hover:text-[#E4CE94] sm:inline">Plan a trip</Link>
        {authed ? <Link to="/dashboard" className="text-white/75 hover:text-[#E4CE94]">My trips</Link> : <Link to="/login" className="inline-flex items-center gap-1 text-white/75 hover:text-[#E4CE94]"><UserRound className="h-3.5 w-3.5" /> Sign in</Link>}
        <a href="tel:112" className="inline-flex items-center gap-1 rounded-lg border border-[#C15B3E] px-2.5 py-1.5 text-[#f3a58e]"><Phone className="h-3.5 w-3.5" /> SOS</a>
      </nav>
    </div>
  </header>;
}
