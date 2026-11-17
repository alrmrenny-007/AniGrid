import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { charImages } from '@/lib/charimg';
import { charById } from '@/lib/chars';
import { fightTables } from '@/lib/fightdb';
import { startFight, finishFight } from '../actions';
import FightGame from '../FightGame';
export const dynamic = 'force-dynamic';
export default async function Fight() {
  const me = await getUser();
  const imgs = await charImages();
  let board = [], wins = 0;
  try {
    await fightTables();
    board = (await sql`select clan, points from clan_scores order by points desc limit 15`).rows;
    if (me) wins = (await sql`select count(*)::int as n from fights where user_id = ${me.id} and won and rewarded > 0`).rows[0].n;
  } catch {}
  return (<>
    <h1>⚔️ Fight Arena</h1>
    <p className={s.mute}>Beat a rival fighter in a best-of-3. Wins score points for your clan.{me ? ` Your ranked wins: ${wins}.` : ''}</p>
    <FightGame me={me ? { character: me.character, username: me.username } : null} imgs={imgs} start={startFight} finish={finishFight} />
    <div className={s.card} style={{ marginTop: '1.5rem' }}>
      <h2>Clan war scores</h2>
      {board.length === 0 && <p className={s.mute}>No points yet. Win a ranked fight to put your clan on the board!</p>}
      {board.map((b, i) => <div key={b.clan} className={s.lb}><span className={s.pos}>{i + 1}</span><span>{charById(b.clan)?.emoji} <b>{charById(b.clan)?.clan || b.clan}</b></span><span className={s.pts}>{b.points}</span></div>)}
    </div>
  </>);
}
