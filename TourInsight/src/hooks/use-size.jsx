import { useLayoutEffect, useState } from 'react';
export function useSize(ref) {
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    const el = ref?.current; if (!el) return;
    const update = () => setSize({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height });
    update(); const ro = new ResizeObserver(update); ro.observe(el); return () => ro.disconnect();
  }, [ref]);
  return size;
}
