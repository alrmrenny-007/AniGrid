'use client';
import { useEffect } from 'react';
import s from './ui.module.css';
export default function Welcome({ name, kind, dismiss }) {
  const jp = kind === 'new' ? 'ようこそ' : 'おかえりなさい';
  const ro = kind === 'new' ? 'Yōkoso' : 'Okaerinasai';
  useEffect(() => { const t = setTimeout(() => dismiss(), 7000); return () => clearTimeout(t); }, []);
  const petals = Array.from({ length: 14 }, (_, i) => ({ left: (i * 7 + 3) % 100, dx: (i % 2 ? 1 : -1) * (40 + ((i * 13) % 90)), dur: 5 + ((i * 37) % 4), delay: (i * 0.4) % 3 }));
  return (
    <div className={s.wel}>
      {petals.map((p, i) => <i key={i} className={s.petal} style={{ left: p.left + '%', '--dx': p.dx + 'px', animationDuration: p.dur + 's', animationDelay: p.delay + 's' }} />)}
      <div className={s.welCard}>
        <div className={s.welRoma}>{ro}</div>
        <div className={s.welJp}>{[...jp].map((ch, i) => <span key={i} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>{ch}</span>)}</div>
        <div className={s.welName}>{name}<small>さん</small></div>
        <p className={s.welSub}>{kind === 'new' ? 'Welcome to Senpai Hub' : 'Welcome back to Senpai Hub'}</p>
        <form action={dismiss} className={s.welBtn}><button className={s.btn}>はじめよう! · Let's go</button></form>
      </div>
    </div>
  );
}
