import './globals.css';
import s from './ui.module.css';
import Nav from './Nav';
import { getUser } from '@/lib/auth';
import { logout } from './actions';
export const metadata = { title: 'Senpai Hub', description: 'Anime community: news, quizzes, GOAT Arena' };
export default async function RootLayout({ children }) {
  const me = await getUser();
  return (
    <html lang="en"><body>
      <Nav me={me ? { username: me.username, ap: me.ap } : null} logout={logout} />
      <main className={s.main}>{children}</main>
    </body></html>
  );
}
