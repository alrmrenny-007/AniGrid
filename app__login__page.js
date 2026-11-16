import Link from 'next/link';
import s from '../ui.module.css';
import { login } from '../actions';
export default async function Login({ searchParams }) {
  const { e } = await searchParams;
  return (<form action={login} className={s.card}>
    <h1>Log in</h1>
    {e && <p className={s.err}>{e}</p>}
    <input className={s.field} name="username" placeholder="Username" required />
    <input className={s.field} name="password" type="password" placeholder="Password" required />
    <button className={s.btn}>Log in</button>
    <p className={s.mute}><Link href="/forgot">Forgot password?</Link> · New here? <Link href="/signup">Create an account</Link></p>
  </form>);
}
