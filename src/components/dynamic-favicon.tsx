'use client';

import { useEffect } from 'react';

/**
 * DynamicFavicon — reads the office logo from localStorage and sets it as the browser favicon.
 * Also updates the document title to the office name.
 * Falls back to the default if no logo/name is saved.
 */
export function DynamicFavicon() {
  useEffect(() => {
    const applyFavicon = () => {
      const logo = localStorage.getItem('autoflow-office-logo');
      if (!logo) return;

      // Remove existing favicons
      document.querySelectorAll('link[rel~="icon"]').forEach(el => el.remove());

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = logo.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      link.href = logo;
      document.head.appendChild(link);
    };

    const applyTitle = () => {
      const officeName = localStorage.getItem('autoflow-office-name');
      if (officeName && officeName.trim()) {
        document.title = officeName.trim();
      } else {
        document.title = 'Minha Oficina';
      }
    };

    const apply = () => {
      applyFavicon();
      applyTitle();
    };

    apply();
    window.addEventListener('storage', apply);
    window.addEventListener('autoflow-logo-updated', apply);
    window.addEventListener('autoflow-settings-updated', apply);

    return () => {
      window.removeEventListener('storage', apply);
      window.removeEventListener('autoflow-logo-updated', apply);
      window.removeEventListener('autoflow-settings-updated', apply);
    };
  }, []);

  return null;
}
