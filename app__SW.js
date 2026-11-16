'use client';
import { useEffect, useState } from 'react';
export default function SW() {
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', () => setEvt(null));
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (!evt) return null;
  return (
    <button onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}
      style={{ position: 'fixed', right: 14, bottom: 84, zIndex: 60, border: 0, borderRadius: 999, padding: '.7rem 1.1rem', fontWeight: 800, color: '#000', background: 'linear-gradient(120deg,#F28500,#ffa94d)', boxShadow: '0 8px 24px rgba(242,133,0,.5)', cursor: 'pointer' }}>
      📲 Install app
    </button>
  );
}
