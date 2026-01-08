export interface BasicAnime {
    id: number;
    title: string;
    genres: string[];
    coverImage: string;
    tags: string[];
    averageScore?: number | null;
    popularity?: number | null;
}

export interface RankedFavorite {
    anime: BasicAnime;
    rank: 1 | 2 | 3 | 4 | 5;
}

export interface Recommendation {
    anime: BasicAnime;
    score: number;
    components: {
        favSim: number;
        tasteSim: number;
        recSupportNorm: number;
        avgScoreNorm: number;
        popPenalty: number;
    };
}
interface TasteProfile {
  genrePref: Record<string, number>;
  tagPref: Record<string, number>;
}

const RANK_WEIGHTS: Record<RankedFavorite["rank"], number> = {
  1: 1.0,
  2: 0.8,
  3: 0.6,
  4: 0.4,
  5: 0.2,
};

function buildTasteProfile(favorites: RankedFavorite[]): TasteProfile {
  const genreScore: Record<string, number> = {};
  const tagScore: Record<string, number> = {};

  for (const fav of favorites) {
    const w = RANK_WEIGHTS[fav.rank];
    const anime = fav.anime;

    for (const g of anime.genres ?? []) {
      genreScore[g] = (genreScore[g] ?? 0) + w;
    }

    for (const t of anime.tags ?? []) {
      tagScore[t] = (tagScore[t] ?? 0) + w;
    }
  }

  const genrePref: Record<string, number> = {};
  const tagPref: Record<string, number> = {};

  const maxGenre = Object.values(genreScore).reduce((m, v) => Math.max(m, v), 0) || 1;
  const maxTag = Object.values(tagScore).reduce((m, v) => Math.max(m, v), 0) || 1;

  for (const [g, v] of Object.entries(genreScore)) {
    genrePref[g] = v / maxGenre;
  }
  for (const [t, v] of Object.entries(tagScore)) {
    tagPref[t] = v / maxTag;
  }

  return { genrePref, tagPref };
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function animeSimilarity(a: BasicAnime, b: BasicAnime): number {
  const genreSim = jaccard(a.genres ?? [], b.genres ?? []);
  const tagSim = jaccard(a.tags ?? [], b.tags ?? []);
  return 0.5 * genreSim + 0.5 * tagSim;
}

function tasteSimilarity(anime: BasicAnime, taste: TasteProfile): number {
  const { genrePref, tagPref } = taste;

  let gSum = 0;
  let gCount = 0;
  for (const g of anime.genres ?? []) {
    if (genrePref[g] !== undefined) {
      gSum += genrePref[g];
      gCount++;
    }
  }

  let tSum = 0;
  let tCount = 0;
  for (const t of anime.tags ?? []) {
    if (tagPref[t] !== undefined) {
      tSum += tagPref[t];
      tCount++;
    }
  }

  const genreTaste = gCount ? gSum / gCount : 0;
  const tagTaste = tCount ? tSum / tCount : 0;

  return 0.5 * genreTaste + 0.5 * tagTaste;
}

function normalizeAvgScore(avg?: number | null): number {
  if (avg == null) return 0;
  return (avg - 50) / 50; // ~[-1,1]
}

const POP_GAMMA = 0.15;
function popularityPenalty(pop?: number | null, maxPop?: number): number {
  if (!pop || !maxPop) return 0;
  const norm = pop / maxPop;
  return -POP_GAMMA * norm;
}

// ---- FINAL RECOMMENDER FUNCTION ----

// how much each part matters in the final score
const W_FAV   = 0.45;  // similarity to the 5 favorites
const W_TASTE = 0.25;  // matches taste profile
const W_AVG   = 0.10;  // AniList average score
const W_POP   = 0.05;  // small popularity penalty

export function recommendFromTop5(
  favorites: RankedFavorite[],
  candidates: BasicAnime[],
  options?: { limit?: number }
): Recommendation[] {
  if (favorites.length !== 5) {
    throw new Error("recommendFromTop5 expects exactly 5 favorites.");
  }

  // 1) build taste profile from the 5 ranked favorites
  const taste = buildTasteProfile(favorites);

  // 2) for popularity penalty normalization
  const maxPopularity = candidates.reduce(
    (m, c) => Math.max(m, c.popularity ?? 0),
    0
  );

  // used to normalize favSim if we want
  const totalRankWeight = favorites.reduce(
    (sum, f) => sum + RANK_WEIGHTS[f.rank],
    0
  );

  const results: Recommendation[] = [];

  // 3) score every candidate
  for (const c of candidates) {
    // --- similarity to each favorite, weighted by rank ---
    let favSim = 0;
    for (const fav of favorites) {
      const w = RANK_WEIGHTS[fav.rank];
      favSim += w * animeSimilarity(c, fav.anime);
    }

    // (optional normalized similarity if you ever need it)
    const favSimNorm = favSim / (totalRankWeight || 1);

    // --- how well it matches overall taste profile ---
    const tasteSim = tasteSimilarity(c, taste);

    // --- AniList average score (normalized) ---
    const avgScoreNorm = normalizeAvgScore(c.averageScore);

    // --- popularity penalty (small negative value for ultra-popular stuff) ---
    const popPenalty = popularityPenalty(c.popularity, maxPopularity);

    // --- final combined score ---
    const score =
      W_FAV * favSim +
      W_TASTE * tasteSim +
      W_AVG * avgScoreNorm +
      W_POP * popPenalty;

    results.push({
      anime: c,
      score,
      components: {
        favSim,
        tasteSim,
        recSupportNorm: 0, // we aren't using rec graph yet
        avgScoreNorm,
        popPenalty,
      },
    });
  }

  // 4) sort from best → worst
  results.sort((a, b) => b.score - a.score);

  // 5) return top N (default 10)
  return results.slice(0, options?.limit ?? 10);
}
