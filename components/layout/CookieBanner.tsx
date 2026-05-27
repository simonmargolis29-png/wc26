'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 sm:px-6"
      style={{ background: '#050B17', borderTop: '1px solid rgba(245,241,232,0.14)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm" style={{ color: 'rgba(245,241,232,0.6)', lineHeight: 1.6 }}>
          We use essential cookies to keep you signed in.{' '}
          <Link href="/cookie-policy" className="underline" style={{ color: '#F5F1E8', textUnderlineOffset: 3 }}>
            Cookie policy
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 btn-primary text-sm px-5 py-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
