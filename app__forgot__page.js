import Link from 'next/link';
import s from '../ui.module.css';
import { resetPassword } from '../actions';
export default async function Forgot({ searchParams }) {
  const { e } = await searchParams;
  return (<form action={resetPassword} className={s.card}>
    <h1>Reset password</h1>
    {e && <p className={s.err}>{e}</p>}
    <p className={s.mute}>Enter the recovery code from your profile. No code? Ask the site admin to generate one for you.</p>
    <input className={s.field} name="username" placeholder="Username" required />
    <input className={s.field} name="code" placeholder="Recovery code (XXXX-XXXX-XXXX)" required />
    <input className={s.field} name="password" type="password" placeholder="New password" required />
    <input className={s.field} name="confirm" type="password" placeholder="Confirm new password" required />
    <button className={s.btn}>Reset password</button>
    <p className={s.mute}><Link href="/login">Back to log in</Link></p>
  </form>);
}
