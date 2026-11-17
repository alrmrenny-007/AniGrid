'use client';
import { playFx } from '@/lib/sfx';
import s from './ui.module.css';
export default function VoiceButton({ id }) {
  return <button type="button" className={s.voice} onClick={() => playFx(id)} aria-label="Hear signature sound">🔊</button>;
}
