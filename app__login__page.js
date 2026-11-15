import s from '../ui.module.css';
import { login, signup } from '../actions';
export default async function Login({ searchParams }) {
  const { e } = await searchParams;
  const F = ({ action, label }) => (
    <form action={action} className={s.card}><h2>{label}</h2>
      <input className={s.field} name="username" placeholder="Username" required />
      <input className={s.field} name="password" type="password" placeholder="Password" required />
      <button className={s.btn}>{label}</button></form>);
  return (<>{e && <p className={s.err}>{e}</p>}<F action={login} label="Log in" /><F action={signup} label="Sign up" /></>);
}
