'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import s from './ui.module.css';
const I = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  cup: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
};
const Icon = ({ d }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>);
const T = [['/', 'Home'], ['/browse', 'Catalog'], ['/quiz', 'Quizzes'], ['/arena', 'Arena'], ['/leaderboard', 'Ranks'], ['/characters', 'Clans']];
export default function Nav({ me, logout, admin }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (h) => (h === '/' ? path === '/' : path.startsWith(h));
  const dock = [['/', 'Home', 'home'], ['/browse', 'Catalog', 'search'], ['/quiz', 'Quizzes', 'bolt'], ['/arena', 'Arena', 'cup'], ['/characters', 'Clans', 'shield'], [me ? '/profile' : '/login', me ? 'Profile' : 'Sign in', 'user']];
  return (<>
    <header className={s.hdr}>
      <div className={s.hdrin}>
        <Link href="/" className={s.logo}>Senpai<b>Hub</b></Link>
        <nav className={s.tabs}>{T.map(([h, t]) => <Link key={h} href={h} className={`${s.tab} ${on(h) ? s.tabOn : ''}`}>{t}</Link>)}</nav>
        <div className={s.right}>
          <form action="/browse" className={s.search}><input name="q" placeholder="Search titles..." /></form>
          {me ? <Link href="/profile" className={s.pill}>{me.username} · {me.ap} AP</Link>
            : <><Link href="/login" className={s.hbtn}>Sign in</Link><Link href="/signup" className={s.pill}>Join</Link></>}
          <button className={s.menuBtn} onClick={() => setOpen(!open)} aria-label="Menu"><Icon d={open ? I.close : I.menu} /></button>
        </div>
      </div>
    </header>
    {open && <>
      <div className={s.scrim} onClick={() => setOpen(false)} />
      <div className={s.sheetM}>
        {T.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
        {me && <Link href="/watchlist">My List</Link>}
        {admin && <Link href="/admin">Admin</Link>}
        {me ? <><Link href="/profile">Profile</Link><form action={logout}><button>Log out</button></form></>
          : <><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link></>}
      </div>
    </>}
    <nav className={s.dock}>
      {dock.map(([h, t, ic]) => (<Link key={h} href={h} className={`${s.dockItem} ${on(h) ? s.dockOn : ''}`}><Icon d={I[ic]} /><span className={s.tip}>{t}</span></Link>))}
      <button className={s.dockItem} onClick={() => setOpen(!open)} aria-label="Menu"><Icon d={open ? I.close : I.menu} /><span className={s.tip}>Menu</span></button>
    </nav>
  </>);
}
