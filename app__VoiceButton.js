'use client';
import { useState } from 'react';
import EmoteBurst from './EmoteBurst';
import s from './ui.module.css';
export default function VoiceButton({ id, img }) {
  const [k, setK] = useState(0);
  return (<>
    <button type="button" className={s.voice} onClick={() => setK(k + 1)} aria-label="Play emote">💬</button>
    <EmoteBurst id={id} k={k} img={img} />
  </>);
}
