'use client';
import { FX } from '@/lib/chars';
import s from './ui.module.css';
export default function EmoteBurst({ id, k, img }) {
  const f = FX[id];
  if (!k || !f) return null;
  return (
    <div key={k} className={s.eb} aria-hidden="true">
      <div className={s.ebLines} />
      <div className={s.ebStage}>
        {img ? <img src={img} alt="" className={s.ebImg} /> : <span className={s.ebEmoji}>{f.emote}</span>}
        <div className={s.ebBubble}>{f.cry}<small>{f.say}</small></div>
      </div>
      {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={s.ebP} style={{ left: `${8 + i * 16}%`, animationDelay: `${i * 0.09}s` }}>{f.emote}</span>)}
    </div>
  );
}
