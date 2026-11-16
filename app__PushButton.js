'use client';
import { useState } from 'react';
import s from './ui.module.css';
const toBytes = (b64) => {
  const p = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
export default function PushButton({ getKey, save }) {
  const [msg, setMsg] = useState('');
  const on = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setMsg('Not supported here. On iPhone, install the app to your home screen first.'); return; }
      if ((await Notification.requestPermission()) !== 'granted') { setMsg('Permission was denied. Allow notifications in your browser settings.'); return; }
      const reg = await navigator.serviceWorker.ready;
      const key = await getKey();
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(key) });
      await save(JSON.parse(JSON.stringify(sub)));
      setMsg('🔔 Notifications are on for this device.');
    } catch (e) { setMsg('Could not enable: ' + (e.message || 'unknown error')); }
  };
  return (<div><button className={s.btn} onClick={on}>🔔 Enable notifications</button>{msg && <p className={s.mute}>{msg}</p>}</div>);
}
