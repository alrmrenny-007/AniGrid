import './globals.css';
import s from './ui.module.css';
import Nav from './Nav';
import SW from './SW';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { logout } from './actions';
export const metadata = { title: 'Senpai Hub', description: 'Anime community: news, quizzes, GOAT Arena', icons: { icon: '/icon-192.png', apple: '/icon-192.png' } };
export const viewport = { themeColor: '#000000' };
export default async function RootLayout({ children }) {
  const me = await getUser();
  return (
    <html lang="en"><body>
      <SW />
      <Nav me={me ? { username: me.username, ap: me.ap } : null} logout={logout} admin={isAdmin(me)} />
      <main className={s.main}>{children}</main>
    </body></html>
  );
}
