import { useState } from "react";
import AnimeInput from "../components/AnimeInput";
import AnimeList from "../components/AnimeList";
import Questionnaire from "../components/Questionaire";
import type { AniListMedia } from "../types";


// export type AnimeItem = {
//   name: string;
//   image: string;
// };
export type AnimeItem = AniListMedia;

export default function HomePage() {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [answers, setAnswers] = useState<{ [anime: string]: string }>({});

  const addAnime = (anime: AnimeItem) => {
    if (!animeList.find((a) => a.id === anime.id)) {
      setAnimeList([...animeList, anime]);
    }
  };

  const saveAnswer = (anime: string, answer: string) => {
    setAnswers({ ...answers, [anime]: answer });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <header className="w-full p-4 bg-blue-600 text-white text-center text-2xl font-bold">
        Anime Recommender
      </header>

      <main className="flex flex-col items-center mt-6 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Find Your Next Favorite Anime
        </h1>
        <p className="mt-2 text-gray-700 text-center">
          Type an anime you recently watched and tell us what you liked about it.
        </p>

        {/* Input */}
        <AnimeInput onAddAnime={addAnime} />

        {/* List of anime with images */}
        <AnimeList animeList={animeList} />

       
      
      </main>
    </div>
  );
}
