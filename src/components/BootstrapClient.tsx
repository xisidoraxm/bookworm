"use client"

import { useEffect } from 'react';

export default function BootstrapClient(): null {
  useEffect(() => {
    let cancelled = false;

    import('bootstrap/dist/js/bootstrap.bundle')
      .then(() => {
        if (cancelled) return;
      })
      .catch((err) => {
        console.error('Failed to load bootstrap JS', err);
      });

    return () => { cancelled = true; };
  }, []);
  return null;
}
