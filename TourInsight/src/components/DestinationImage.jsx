import React, { useEffect, useState } from 'react';
import { getPlaceImage, FALLBACK_IMAGE } from '@/lib/placeImages';
import { cn } from '@/lib/utils';

export default function DestinationImage({ place, city = '', state = '', country = '', alt = '', className, variant = 'full', showBadge = false }) {
  const [src, setSrc] = useState(FALLBACK_IMAGE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const result = await getPlaceImage({ place, city, state, country });
        if (!alive) return;
        setSrc((variant === 'thumb' ? result?.thumb_url : result?.image_url) || result?.thumb_url || FALLBACK_IMAGE);
      } catch { if (alive) setSrc(FALLBACK_IMAGE); }
      finally { if (alive) setLoading(false); }
    }, 400);
    return () => { alive = false; clearTimeout(timer); };
  }, [place, city, state, country, variant]);
  return <div className={cn('relative overflow-hidden bg-muted', className)}>
    {loading && <div className="absolute inset-0 animate-pulse bg-muted" />}
    <img src={src} alt={alt || place || 'Travel destination'} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
    {showBadge && src !== FALLBACK_IMAGE ? <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-[9px] uppercase tracking-wide text-white">Wikipedia image</span> : null}
  </div>;
}
