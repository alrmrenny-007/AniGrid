import Link from 'next/link';
import s from '../ui.module.css';
import { resetPassword } from '../actions';
export default async function Forgot({ searchParams }) {
  const { e } = await searchParams;
  return (<div className={s.auth}>
    <aside className={s.authArt}>
      <div className={s.emblem} style={{ '--sz': '110px', margin: 0 }}>🔑</div>
      <h2>Recover your account</h2>
      <ul className={s.perks}><li>🧾 Use the recovery code from your profile</li><li>🛠️ No code? Ask the admin to generate one</li></ul>
    </aside>
    <form action={resetPassword} className={`${s.card} ${s.authBox}`}>
      <h1>Reset password</h1>
      {e && <p className={s.err}>{e}</p>}
      <input className={s.field} name="username" placeholder="Username" required />
      <input className={s.field} name="code" placeholder="Recovery code (XXXX-XXXX-XXXX)" required />
      <input className={s.field} name="password" type="password" placeholder="New password" required />
      <input className={s.field} name="confirm" type="password" placeholder="Confirm new password" required />
      <button className={s.btn}>Reset password</button>
      <p className={s.mute}><Link href="/login">Back to log in</Link></p>
    </form>
  </div>);
}
