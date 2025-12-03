export interface BasicAnime {
    id: number;
    title: string;
    genres: string[];
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
