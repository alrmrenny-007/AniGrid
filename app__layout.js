import './globals.css';
import s from './ui.module.css';
import Nav from './Nav';
import SW from './SW';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { logout, chooseCharacter, skipPicker } from './actions';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import CharPicker from './CharPicker';
export const metadata = { title: 'Senpai Hub', description: 'Anime community: news, quizzes, GOAT Arena', icons: { icon: '/icon-192.png', apple: '/icon-192.png' } };
export const viewport = { themeColor: '#000000' };
export default async function RootLayout({ children }) {
  const me = await getUser();
  const show = !!me && !me.character && !!(await cookies()).get('pickchar');
  const counts = show ? (await sql`select character, count(*)::int as n from users where character is not null group by character`).rows : [];
  return (
    <html lang="en"><body>
      <SW />
      {show && <CharPicker ap={me.ap} counts={counts} choose={chooseCharacter} skip={skipPicker} />}
      <Nav me={me ? { username: me.username, ap: me.ap } : null} logout={logout} admin={isAdmin(me)} />
      <main className={s.main}>{children}</main>
    </body></html>
  );
}
