'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import s from './ui.module.css';
const I = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  cup: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};
const Icon = ({ d }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>);
const L = [['/', 'Home'], ['/quiz', 'Quizzes'], ['/arena', 'GOAT Arena'], ['/leaderboard', 'Ranks'], ['/characters', 'Clans']];
export default function Nav({ me, logout, admin }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (h) => (h === '/' ? path === '/' : path.startsWith(h));
  const cls = (h) => `${s.item} ${on(h) ? s.active : ''}`;
  const tabs = [['/', 'Home', 'home'], ['/quiz', 'Quiz', 'bolt'], ['/arena', 'Arena', 'cup'], ['/characters', 'Clans', 'shield'], [me ? '/profile' : '/login', me ? 'Me' : 'Login', 'user']];
  return (<>
    <nav className={`${s.nav} ${open ? s.open : ''}`}>
      <div className={s.navin}>
        <Link href="/" className={s.logo}>Senpai<b>Hub</b></Link>
        <button className={s.burger} onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /><i /></button>
        <div className={s.links}>
          {L.map(([h, t]) => <Link key={h} href={h} className={cls(h)}>{t}</Link>)}
          {me && <Link href="/watchlist" className={cls('/watchlist')}>My List</Link>}
          {admin && <Link href="/admin" className={cls('/admin')}>Admin</Link>}
          {me ? (<>
            <Link href="/profile" className={`${cls('/profile')} ${s.pill}`}>{me.username} · {me.ap} AP</Link>
            <form action={logout}><button className={s.item}>Logout</button></form>
          </>) : <><Link href="/login" className={cls('/login')}>Login</Link><Link href="/signup" className={`${cls('/signup')} ${s.pill}`}>Sign up</Link></>}
        </div>
      </div>
    </nav>
    <nav className={s.tabbar}>
      {tabs.map(([h, t, ic]) => (<Link key={h} href={h} className={`${s.tab} ${on(h) ? s.tabOn : ''}`}><Icon d={I[ic]} />{t}</Link>))}
    </nav>
  </>);
}
