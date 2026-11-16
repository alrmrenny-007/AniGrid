import s from './ui.module.css';
export default function Loading() {
  return (<div className={s.loadWrap}><div className={s.spinner} /><p className={s.mute}>Loading…</p></div>);
}
