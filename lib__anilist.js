export const F = 'idMal title{romaji english} coverImage{large extraLarge} bannerImage averageScore episodes status genres seasonYear format description(asHtml:false)';
export async function gql(query, variables, revalidate = 1800) {
  try {
    const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query, variables }), next: { revalidate } });
    return (await r.json()).data || null;
  } catch { return null; }
}
export const norm = (m) => ({
  id: m.idMal, title: m.title?.english || m.title?.romaji, thumb: m.coverImage?.large, img: m.coverImage?.extraLarge,
  wide: m.bannerImage || m.coverImage?.extraLarge, score: m.averageScore ? (m.averageScore / 10).toFixed(1) : null,
  genre: m.genres?.[0] || m.format || 'Anime', year: m.seasonYear, eps: m.episodes,
  syn: (m.description || '').replace(/<[^>]*>/g, ''), live: m.status === 'RELEASING',
});
