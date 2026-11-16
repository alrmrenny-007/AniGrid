'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import s from './ui.module.css';
const L = [['/', 'Home'], ['/quiz', 'Quizzes'], ['/arena', 'GOAT Arena'], ['/leaderboard', 'Ranks']];
export default function Nav({ me, logout, admin }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const cls = (h) => `${s.item} ${path === h ? s.active : ''}`;
  return (
    <nav className={`${s.nav} ${open ? s.open : ''}`}>
      <div className={s.navin}>
        <Link href="/" className={s.logo}>Senpai<b>Hub</b></Link>
        <button className={s.burger} onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /><i /></button>
        <div className={s.links}>
          {L.map(([h, t]) => <Link key={h} href={h} className={cls(h)}>{t}</Link>)}
          {admin && <Link href="/admin" className={cls('/admin')}>Admin</Link>}
          {me ? (<>
            <Link href="/profile" className={`${cls('/profile')} ${s.pill}`}>{me.username} · {me.ap} AP</Link>
            <form action={logout}><button className={s.item}>Logout</button></form>
          </>) : <Link href="/login" className={cls('/login')}>Login</Link>}
        </div>
      </div>
    </nav>
  );
}
