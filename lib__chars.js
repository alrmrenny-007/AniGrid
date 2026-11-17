export const TASKS = {
  quiz: ['Answer 3 quizzes correctly', 3],
  vote: ['Cast 8 votes in the Arena', 8],
  watch: ['Complete 2 anime on your list', 2],
  comment: ['Post 5 comments', 5],
  daily: ['Claim the daily bonus 3 times', 3],
};
const LABEL = { quiz: 'quizzes', vote: 'Arena votes', watch: 'finished anime', comment: 'comments', daily: 'the daily bonus' };
export const perkText = (p) => Object.entries(p).map(([k, v]) => `+${Math.round(v * 100)}% AP from ${LABEL[k]}`).join(', ');
export const tierOf = (c) => (c.cost === 0 ? 'Starter' : c.cost < 300 ? 'Rare' : 'Legendary');
const C = (id, name, emoji, clan, cost, perk, blurb, q) => ({ id, name, emoji, clan, cost, perk, blurb, q: q || name, main: Object.keys(perk)[0] });
export const CHARS = [
  C('ronin', 'Roronoa Zoro', '⚔️', 'Crimson Ronin', 0, { quiz: 0.2 }, 'Three swords, zero mistakes.'),
  C('kitsune', 'Naruto Uzumaki', '🦊', 'Nine-Tail Court', 0, { vote: 0.2 }, 'Never backs down from a vote.'),
  C('sakura', 'Sakura Haruno', '🌸', 'Petal Circle', 0, { comment: 0.2 }, 'Her words hit harder than her fists.'),
  C('monk', 'Rock Lee', '⚡', 'Storm Temple', 0, { daily: 0.2 }, 'Trains every single day.'),
  C('otaku', 'Edward Elric', '🤖', 'Steel Watchers', 0, { watch: 0.2 }, 'Equivalent exchange: one episode for one more.'),
  C('shinobi', 'Itachi Uchiha', '🥷', 'Night Veil', 150, { quiz: 0.3 }, 'Strikes with perfect answers.'),
  C('oracle', 'Lelouch Lamperouge', '🌙', 'Lunar Sight', 150, { vote: 0.3 }, 'Reads the crowd before it moves.'),
  C('scholar', 'Senku Ishigami', '🐉', 'Jade Library', 150, { watch: 0.3 }, 'Ten billion percent hooked on anime.'),
  C('bard', 'Gintoki Sakata', '🎤', 'Thunder Chorus', 150, { comment: 0.3 }, 'Has a comment for everything.'),
  C('samurai', 'Kenshin Himura', '🌅', 'Rising Sun', 150, { daily: 0.3 }, 'Never misses the morning.'),
  C('emperor', 'Light Yagami', '👑', 'Void Throne', 400, { quiz: 0.4, vote: 0.15 }, 'Rules quizzes and the arena.'),
  C('idol', 'Ai Hoshino', '✨', 'Star Choir', 400, { comment: 0.4, daily: 0.15 }, 'The whole Hub hangs on every word.'),
  C('phoenix', 'Portgas D. Ace', '🔥', 'Ember Order', 400, { daily: 0.4, quiz: 0.15 }, 'Burns bright every single day.'),
  C('oni', 'Madara Uchiha', '👹', 'Red Horn Legion', 400, { vote: 0.4, comment: 0.15 }, 'Commands the Arena.'),
  C('archivist', 'Kakashi Hatake', '📜', 'Ghost Archive', 400, { watch: 0.4, comment: 0.15 }, 'Copied a thousand episodes.'),
];
export const charById = (id) => CHARS.find((c) => c.id === id);

export const FX = {
  ronin: { emote: '⚔️', cry: '三刀流', say: 'Santōryū', sfx: 'slash' },
  kitsune: { emote: '🍥', cry: 'だってばよ!', say: 'Dattebayo', sfx: 'swirl' },
  sakura: { emote: '🌸', cry: 'しゃーんなろー!', say: 'Shannarō', sfx: 'chime' },
  monk: { emote: '💪', cry: '青春!', say: 'Seishun', sfx: 'zap' },
  otaku: { emote: '⚙️', cry: '等価交換!', say: 'Tōka kōkan', sfx: 'alchemy' },
  shinobi: { emote: '🌙', cry: '月読', say: 'Tsukuyomi', sfx: 'shadow' },
  oracle: { emote: '👁️', cry: 'ギアス!', say: 'Geass', sfx: 'geass' },
  scholar: { emote: '🧪', cry: '百億パーセント!', say: 'Hyaku-oku pāsento', sfx: 'bubble' },
  bard: { emote: '🍓', cry: '万事屋銀ちゃん', say: 'Yorozuya Gin-chan', sfx: 'boing' },
  samurai: { emote: '🗡️', cry: 'おろ?', say: 'Oro?', sfx: 'flute' },
  emperor: { emote: '📓', cry: '新世界の神', say: 'Shin sekai no kami', sfx: 'stab' },
  idol: { emote: '⭐', cry: 'アイドル!', say: 'Aidoru', sfx: 'idol' },
  phoenix: { emote: '🔥', cry: '火拳!', say: 'Hiken', sfx: 'fire' },
  oni: { emote: '👹', cry: '須佐能乎', say: 'Susanoo', sfx: 'gong' },
  archivist: { emote: '⚡', cry: '千鳥!', say: 'Chidori', sfx: 'chirp' },
};
