'use client';
import { useState, useEffect, useTransition } from 'react';
import { submitQuiz, startQuiz } from '../actions';
import s from '../ui.module.css';
export default function Quiz({ q }) {
  const [left, setLeft] = useState(null);
  const [res, setRes] = useState(null);
  const [, start] = useTransition();
  const send = (c) => { if (!res) start(async () => setRes(await submitQuiz(q.id, c))); };
  useEffect(() => { startQuiz(q.id).then((r) => (r.error ? setRes(r) : setLeft(r.remaining))); }, []);
  useEffect(() => {
    if (res || left === null) return;
    if (left <= 0) { send(-1); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, res]);
  return (<div className={s.card}>
    {!res && left !== null && <span className={s.timer}>{left}s</span>}
    <p className={s.mute}>{q.title} · +{q.ap} AP{q.badge ? ` · 🏅 ${q.badge}` : ''}</p>
    <h3>{q.question}</h3>
    {q.options.map((o, i) => (
      <button key={i} disabled={!!res || left === null} onClick={() => send(i)}
        className={`${s.opt} ${res && res.answer === i ? s.good : ''}`}>{o}</button>))}
    {res && <p>{res.error || (res.late ? "Time's up!" : res.correct ? `Correct! +${res.ap} AP` : 'Not this time.')}</p>}
  </div>);
}
