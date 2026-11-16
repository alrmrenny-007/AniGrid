import Link from 'next/link';
import s from '../ui.module.css';
import { signup } from '../actions';
export default async function Signup({ searchParams }) {
  const { e } = await searchParams;
  return (<div className={s.auth}>
    <aside className={s.authArt}>
      <div className={s.emblem} style={{ '--sz': '110px', margin: 0 }}>★</div>
      <h2>Begin your legend</h2>
      <ul className={s.perks}><li>🥷 Choose from 15 fighters with unique abilities</li><li>🛡️ Join a clan and climb together</li><li>🏆 Earn AP, ranks and badges</li></ul>
    </aside>
    <form action={signup} className={`${s.card} ${s.authBox}`}>
      <h1>Create account</h1>
      {e && <p className={s.err}>{e}</p>}
      <input className={s.field} name="username" placeholder="Username (3-24, letters/numbers)" maxLength={24} autoComplete="username" required />
      <input className={s.field} name="password" type="password" placeholder="Password (6+ characters)" autoComplete="new-password" required />
      <input className={s.field} name="confirm" type="password" placeholder="Confirm password" autoComplete="new-password" required />
      <button className={s.btn}>Sign up · +10 AP</button>
      <p className={s.mute}>Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  </div>);
}
