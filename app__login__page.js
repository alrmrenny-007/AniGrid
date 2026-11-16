import Link from 'next/link';
import s from '../ui.module.css';
import { login } from '../actions';
export default async function Login({ searchParams }) {
  const { e } = await searchParams;
  return (<div className={s.auth}>
    <aside className={s.authArt}>
      <div className={s.emblem} style={{ '--sz': '110px', margin: 0 }}>★</div>
      <h2>Welcome back, challenger</h2>
      <ul className={s.perks}><li>⚡ Claim your daily streak bonus</li><li>⚔️ Defend your clan's rank</li><li>🐐 Vote in the GOAT Arena</li></ul>
    </aside>
    <form action={login} className={`${s.card} ${s.authBox}`}>
      <h1>Log in</h1>
      {e && <p className={s.err}>{e}</p>}
      <input className={s.field} name="username" placeholder="Username" autoComplete="username" required />
      <input className={s.field} name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      <button className={s.btn}>Enter the Hub</button>
      <p className={s.mute}><Link href="/forgot">Forgot password?</Link> · New here? <Link href="/signup">Create an account</Link></p>
    </form>
  </div>);
}
