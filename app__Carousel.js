'use client';
import { useState, useEffect, useRef } from 'react';
import s from './ui.module.css';
export default function Carousel({ slides }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const x0 = useRef(0);
  const n = slides.length;
  const go = (d) => setI((v) => (v + d + n) % n);
  useEffect(() => {
    if (hold) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [hold, n]);
  return (
    <div className={s.car}
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; setHold(true); }}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - x0.current; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); setHold(false); }}>
      <div className={s.track} style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((c, k) => (
          <article key={k} className={s.slide}
            style={c.img ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.92),rgba(0,0,0,.3)),url("${c.img}")` } : undefined}>
            <span className={s.tag}>{c.tag}</span>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
          </article>
        ))}
      </div>
      <button className={`${s.arrow} ${s.prev}`} onClick={() => go(-1)} aria-label="Previous">‹</button>
      <button className={`${s.arrow} ${s.next}`} onClick={() => go(1)} aria-label="Next">›</button>
      <div className={s.dots}>
        {slides.map((_, k) => <button key={k} className={k === i ? s.dotOn : s.dot} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} />)}
      </div>
      <div key={i} className={s.prog} style={{ animationPlayState: hold ? 'paused' : 'running' }} />
    </div>
  );
}
