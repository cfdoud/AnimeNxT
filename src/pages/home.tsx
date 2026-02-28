import { useState } from "react";
import AnimeInput from "../components/AnimeInput";
import AnimeList from "../components/AnimeList";
import Results from "../components/Results";
import type { AniListMedia } from "../types";
import { fetchCandidatePool } from "../api/anilist";
import {
  recommendFromTop5,
  type BasicAnime,
  type RankedFavorite,
  type Recommendation,
} from "../utils/recommender";

export type AnimeItem = AniListMedia;

export default function HomePage() {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  // const [answers, setAnswers] = useState<{ [anime: string]: string }>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [candidatePool, setCandidatePool] = useState<BasicAnime[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const addAnime = (anime: AnimeItem) => {
    if (!animeList.find((a) => a.id === anime.id)) {
      setAnimeList([...animeList, anime]);
    }
  };

  function toBasicAnimeFromMedia(media: any): BasicAnime {
    const title =
      media.title?.english ||
      media.title?.romaji ||
      (typeof media?.title === "string" ? media.title : "Untitled");
    const coverImage = media?.coverImage?.large || "";
    return {
      id: media.id,
      title,
      genres: media.genres ?? [],
      tags: (media.tags ?? []).map((t: any) => t.name),
      coverImage,
      averageScore: media.averageScore ?? null,
      popularity: media.popularity ?? null,
    };
  }

  function buildFavorites(list: AnimeItem[]): RankedFavorite[] {
    if (list.length !== 5) {
      throw new Error("Need exactly 5 anime selected to run the recommender.");
    }
    return list.map((media, index) => ({
      anime: toBasicAnimeFromMedia(media),
      rank: (index + 1) as 1 | 2 | 3 | 4 | 5,
    }));
  }

  function hasPrequel(media: any): boolean {
    const edges = media?.relations?.edges ?? [];
    return edges.some((e: any) => e?.relationType === "PREQUEL");
  }

  function buildCandidatesFromPool(pool: AniListMedia[], favorites: AnimeItem[]): BasicAnime[] {
    const favIds = new Set(favorites.map((f) => f.id));
    const map = new Map<number, BasicAnime>();
    for (const m of pool) {
      if (!m) continue;
      if (favIds.has(m.id)) continue;
      if (hasPrequel(m)) continue;
      const basic = toBasicAnimeFromMedia(m);
      map.set(basic.id, basic);
    }
    return Array.from(map.values());
  }

  const runRecommendations = async (): Promise<Recommendation[]> => {
    if (animeList.length !== 5) {
      alert("Please add exactly 5 anime first (you have " + animeList.length + ").");
      return [];
    }

    setIsLoading(true);
    try {
      const favorites = buildFavorites(animeList);

      let pool = candidatePool;
      if (pool.length === 0) {
        const raw = await fetchCandidatePool({
          sorts: ["POPULARITY_DESC", "SCORE_DESC"],
          pagesPerSort: 2,
        });
        const built = buildCandidatesFromPool(raw, animeList);
        setCandidatePool(built);
        pool = built;
      }

      const freshPool = pool.filter((a) => !seenIds.has(a.id));

      if (freshPool.length === 0) {
        alert("You've seen all available recommendations!");
        return [];
      }

      const recs = recommendFromTop5(favorites, freshPool, { limit: 10 });
      setSeenIds((prev) => new Set([...prev, ...recs.map((r) => r.anime.id)]));
      setRecommendations(recs);
      return recs;
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnough = animeList.length === 5;

  return (
    <div className="min-h-screen bg-[#080810] text-white font-sans overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-900/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black">
              N
            </div>
            <span className="text-lg font-bold tracking-tight">
              Anime<span className="text-indigo-400">NxT</span>
            </span>
          </div>
          <span className="text-xs text-white/30 tracking-widest uppercase">
            Find Your Next Watch
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tight mb-3">
            What's{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Next
            </span>
            ?
          </h1>
          <p className="text-white/40 text-sm tracking-wide">
            Add 5 anime you love · drag to rank · get your next obsession
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT panel */}
          <div className="rounded-2xl border border-white/5 bg-white/3 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
                Your List
              </span>
              <span
                className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  hasEnough
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {animeList.length} / 5
              </span>
            </div>

            <AnimeInput onAddAnime={addAnime} />
            <AnimeList animeList={animeList} onRecommend={runRecommendations} />

            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Scanning the algorithm...
              </div>
            )}
          </div>

          {/* RIGHT panel */}
          <div className="rounded-2xl border border-white/5 bg-white/3 backdrop-blur-sm p-6 lg:sticky lg:top-6 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">
                Recommendations
              </span>
            </div>

            {recommendations.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">⚔️</div>
                <p className="text-white/20 text-sm">
                  Add 5 anime and hit<br />
                  <span className="text-indigo-400">Get Recommendations</span>
                </p>
              </div>
            )}

            <Results
              recommendations={recommendations}
              onRecommend={runRecommendations}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
