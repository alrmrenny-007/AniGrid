'use client';
import { useState } from 'react';
import s from './ui.module.css';
async function shrink(file, max = 480) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read image')); i.src = url; });
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', 0.82);
}
export default function PicUploader({ chars, imgs, save }) {
  const [pics, setPics] = useState(imgs || {});
  const [st, setSt] = useState({});
  const mark = (id, v) => setSt((p) => ({ ...p, [id]: v }));
  const pick = async (c, file) => {
    if (!file) return;
    mark(c.id, 'Uploading…');
    try {
      const data = await shrink(file);
      const r = await save(c.id, data);
      if (r?.error) throw new Error(r.error);
      setPics((p) => ({ ...p, [c.id]: data }));
      mark(c.id, '✓ Saved');
    } catch (e) { mark(c.id, 'Failed: ' + String(e.message || e).slice(0, 60)); }
  };
  return (<div>{chars.map((c) => (
    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', margin: '.6rem 0' }}>
      {pics[c.id] ? <img src={pics[c.id]} alt="" className={s.fthumb} style={{ margin: 0, flex: 'none' }} /> : <span style={{ fontSize: '1.8rem', width: 56, textAlign: 'center', flex: 'none' }}>{c.emoji}</span>}
      <div style={{ flex: 1 }}><b>{c.name}</b><div className={s.mute} style={{ fontSize: '.78rem' }}>{st[c.id] || (pics[c.id] ? 'Has portrait' : 'No portrait yet')}</div></div>
      <label className={s.btnGhost} style={{ cursor: 'pointer', padding: '.45rem .9rem' }}>Choose<input type="file" accept="image/*" hidden onChange={(e) => pick(c, e.target.files?.[0])} /></label>
    </div>))}</div>);
}
