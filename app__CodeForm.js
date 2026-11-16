'use client';
import { useState } from 'react';
import s from './ui.module.css';
export default function CodeForm({ action, label, withUser }) {
  const [code, setCode] = useState(null);
  const [err, setErr] = useState(null);
  return (
    <form action={async (fd) => { setErr(null); setCode(null); const r = await action(fd); if (r?.error) setErr(r.error); else setCode(r?.code); }}>
      {withUser && <input className={s.field} name="username" placeholder="Exact username" maxLength={40} required />}
      <button className={s.btn}>{label}</button>
      {code && <p><b style={{ fontSize: '1.3rem', letterSpacing: '.08em', color: '#F28500' }}>{code}</b><br /><span className={s.mute}>Save it now. It won't be shown again.</span></p>}
      {err && <p className={s.err}>{err}</p>}
    </form>
  );
}
