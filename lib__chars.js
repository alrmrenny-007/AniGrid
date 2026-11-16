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
const C = (id, name, emoji, clan, cost, perk, blurb) => ({ id, name, emoji, clan, cost, perk, blurb, main: Object.keys(perk)[0] });
export const CHARS = [
  C('ronin', 'Ronin Blade', '⚔️', 'Crimson Ronin', 0, { quiz: 0.2 }, 'Sharp mind, sharper sword.'),
  C('kitsune', 'Kitsune Trickster', '🦊', 'Nine-Tail Court', 0, { vote: 0.2 }, 'Always on the winning side of a vote.'),
  C('sakura', 'Sakura Mage', '🌸', 'Petal Circle', 0, { comment: 0.2 }, 'Words bloom into power.'),
  C('monk', 'Thunder Monk', '⚡', 'Storm Temple', 0, { daily: 0.2 }, 'Discipline, every single day.'),
  C('otaku', 'Iron Otaku', '🤖', 'Steel Watchers', 0, { watch: 0.2 }, 'Has seen it all, twice.'),
  C('shinobi', 'Shadow Shinobi', '🥷', 'Night Veil', 150, { quiz: 0.3 }, 'Strikes with perfect answers.'),
  C('oracle', 'Moon Oracle', '🌙', 'Lunar Sight', 150, { vote: 0.3 }, 'Reads the crowd before it moves.'),
  C('scholar', 'Dragon Scholar', '🐉', 'Jade Library', 150, { watch: 0.3 }, 'Studies every season.'),
  C('bard', 'Storm Bard', '🎤', 'Thunder Chorus', 150, { comment: 0.3 }, 'Every comment is a performance.'),
  C('samurai', 'Dawn Samurai', '🌅', 'Rising Sun', 150, { daily: 0.3 }, 'Never misses the morning.'),
  C('emperor', 'Void Emperor', '👑', 'Void Throne', 400, { quiz: 0.4, vote: 0.15 }, 'Rules quizzes and the arena.'),
  C('idol', 'Celestial Idol', '✨', 'Star Choir', 400, { comment: 0.4, daily: 0.15 }, 'The whole Hub hangs on every word.'),
  C('phoenix', 'Phoenix Sage', '🔥', 'Ember Order', 400, { daily: 0.4, quiz: 0.15 }, 'Rises again every day.'),
  C('oni', 'Oni Warlord', '👹', 'Red Horn Legion', 400, { vote: 0.4, comment: 0.15 }, 'Commands the Arena.'),
  C('archivist', 'Spirit Archivist', '📜', 'Ghost Archive', 400, { watch: 0.4, comment: 0.15 }, 'Remembers every episode.'),
];
export const charById = (id) => CHARS.find((c) => c.id === id);
