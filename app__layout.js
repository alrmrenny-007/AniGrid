import './globals.css';
import Link from 'next/link';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import s from './ui.module.css';
import Nav from './Nav';
import SW from './SW';
import CharPicker from './CharPicker';
import { charImages } from '@/lib/charimg';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { logout, chooseCharacter, skipPicker } from './actions';
const head = Manrope({ subsets: ['latin'], variable: '--font-head' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const metadata = { title: 'Senpai Hub', description: 'Anime community: news, quizzes, GOAT Arena', icons: { icon: '/icon-192.png', apple: '/icon-192.png' } };
export const viewport = { themeColor: '#070706' };
export default async function RootLayout({ children }) {
  const me = await getUser();
  const show = !!me && !me.character && !!(await cookies()).get('pickchar');
  const counts = show ? (await sql`select character, count(*)::int as n from users where character is not null group by character`).rows : [];
  const imgs = show ? await charImages() : {};
  return (
    <html lang="en" className={`${head.variable} ${mono.variable}`}><body>
      <SW />
      {show && <CharPicker ap={me.ap} counts={counts} imgs={imgs} choose={chooseCharacter} skip={skipPicker} />}
      <Nav me={me ? { username: me.username, ap: me.ap } : null} logout={logout} admin={isAdmin(me)} />
      <main className={s.main}>{children}</main>
      <footer className={s.footer}>
        <div className={s.footin}>
          <div><div className={s.logo}>Senpai<b>Hub</b></div><p className={s.mute}>Anime quizzes, brackets and clans. Prove you are the greatest.</p></div>
          <div><h4>Explore</h4><Link href="/">Home</Link><Link href="/browse">Catalog</Link><Link href="/quiz">Quizzes</Link><Link href="/arena">GOAT Arena</Link></div>
          <div><h4>Community</h4><Link href="/leaderboard">Ranks</Link><Link href="/characters">Clans</Link><Link href="/signup">Join</Link></div>
        </div>
        <p className={s.copy}>© 2026 Senpai Hub · Anime data & covers via Jikan / MyAnimeList</p>
      </footer>
    </body></html>
  );
}
