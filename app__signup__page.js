import Link from 'next/link';
import s from '../ui.module.css';
import { signup } from '../actions';
export default async function Signup({ searchParams }) {
  const { e } = await searchParams;
  return (<form action={signup} className={s.card}>
    <h1>Create account</h1>
    {e && <p className={s.err}>{e}</p>}
    <input className={s.field} name="username" placeholder="Username (3-24, letters/numbers)" maxLength={24} required />
    <input className={s.field} name="password" type="password" placeholder="Password (6+ characters)" required />
    <input className={s.field} name="confirm" type="password" placeholder="Confirm password" required />
    <button className={s.btn}>Sign up (+10 AP)</button>
    <p className={s.mute}>Already have an account? <Link href="/login">Log in</Link></p>
  </form>);
}
