import { useState } from "react";
import AnimeInput from "../components/AnimeInput";
import AnimeList from "../components/AnimeList";
// import Questionnaire from "../components/Questionaire";
import Results from "../components/Results";
import type { AniListMedia } from "../types";

import { fetchCandidatePool } from "../api/anilist";
 
import {
  recommendFromTop5,
  type BasicAnime,
  type RankedFavorite,
  type Recommendation,
} from "../utils/recommender";


// export type AnimeItem = {
//   name: string;
//   image: string;
// };
export type AnimeItem = AniListMedia;

export default function HomePage() {
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";

  });
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [answers, setAnswers] = useState<{ [anime: string]: string }>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const addAnime = (anime: AnimeItem) => {
    if (!animeList.find((a) => a.id === anime.id)) {
      setAnimeList([...animeList, anime]);
    }
  };

  function toBasicAnimeFromMedia(media: any): BasicAnime {
    const title =
      media.title?.english ||
      media.title?.romaji ||
      (typeof media?.title === "string" ? media.title: "Untitled");
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
      // for now, order in the list = rank (1 strongest → 5 weakest)
      rank: (index + 1) as 1 | 2 | 3 | 4 | 5,
    }));
  }

  

  function hasPrequel(media: any): boolean {
    const edges = media?.relations?.edges ?? [];
    
    return edges.some(
      (e: any) => e?.relationType === "PREQUEL"
    );
  }



  function buildCandidatesFromPool(pool: AniListMedia[], favorites: AnimeItem[]): BasicAnime[] {
    const favIds = new Set(favorites.map((f) => f.id));
    const map = new Map<number, BasicAnime>();

    for (const m of pool) {
      if (!m) continue;
      if (favIds.has(m.id)) continue;

      if (hasPrequel(m)) continue;

      const basic = toBasicAnimeFromMedia(m);
      map.set(basic.id, basic); // Map dedupes by id
    }
    return Array.from(map.values());
  }

  // // 🔹 build candidates from AniList's recommendations field
  // function buildCandidatesFromPicked(list: AnimeItem[]): BasicAnime[] {
  //   const map = new Map<number, BasicAnime>();

  //   for (const media of list) {
  //     const edges = media.recommendations?.edges ?? [];

  //     for (const edge of edges) {
  //       const rec = edge.node?.mediaRecommendation;
  //       if (!rec) continue;

  //       // skip if it's one of the 5 favorites
  //       if (list.some((p) => p.id === rec.id)) continue;

  //       const basic = toBasicAnimeFromMedia(rec);
  //       map.set(basic.id, basic); // Map dedupes by id
  //     }
  //   }

  //   return Array.from(map.values());
  // }

  const runRecommendations = async () => {
  if (animeList.length !== 5) {
    alert("Please add exactly 5 anime first (you have " + animeList.length + ").");
    return;
  }

  const favorites = buildFavorites(animeList);
  // const candidates = buildCandidatesFromPool(animeList);
  const pool = await fetchCandidatePool({ 
    sorts: ["POPULARITY_DESC", "SCORE_DESC"], 
    pagesPerSort: 2 
  });

  const candidates = buildCandidatesFromPool(pool, animeList);

  if (candidates.length === 0) {
    alert("AniList didn't return any recommendation candidates. Try different anime.");
    return;
  }

  const recs = recommendFromTop5(favorites, candidates, { limit: 10 });
  console.log("Recs:", recs);
  setRecommendations(recs);
};


  // const saveAnswer = (anime: string, answer: string) => {
  //   setAnswers({ ...answers, [anime]: answer });
  // };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <header className="w-full p-4 bg-blue-600 text-black text-center text-2xl font-bold">
        Anime Recommender
      </header>

      <main className="flex flex-col items-center mt-6 w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Find Your Next Favorite Anime
        </h1>
        <p className="mt-2 text-gray-700 text-center">
          Type an anime you recently watched and tell us what you liked about it.
        </p>

        {/* Input */}
        

        {/* List of anime with images */}
        <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: input + picked anime */}
          <div className="bg-black rounded-xl shadow p-4">
            <AnimeInput onAddAnime={addAnime} />
            <AnimeList animeList={animeList} onRecommend={runRecommendations} />
          </div>

          {/* RIGHT: recommendations */}
          <div className="bg-white rounded-xl shadow p-4 md:sticky md:top-6 h-fit">
            <Results recommendations={recommendations} />
          </div>
        </div>


      
      
      </main>
    </div>
  );
}
