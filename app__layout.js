import Link from 'next/link';
import './globals.css';
import s from './ui.module.css';
import { getUser } from '@/lib/auth';
import { logout } from './actions';
export const metadata = { title: 'Anime Hub', description: 'Anime community: news, quizzes, GOAT Arena' };
export default async function RootLayout({ children }) {
  const me = await getUser();
  return (
    <html lang="en"><body>
      <nav className={s.nav}>
        <Link href="/" className={s.logo}>AnimeHub</Link>
        <Link href="/quiz">Quizzes</Link>
        <Link href="/arena">GOAT Arena</Link>
        <span className={s.spacer} />
        {me ? (<><Link href="/profile">{me.username} · {me.ap} AP</Link>
          <form action={logout}><button className={s.link}>Logout</button></form></>) : <Link href="/login">Login</Link>}
      </nav>
      <main className={s.main}>{children}</main>
    </body></html>
  );
}
