import { useState } from "react";
import { Link } from "react-router-dom";
import AnimeInput from "../components/AnimeInput";

export default function HomePage() {
  const [animeList, setAnimeList] = useState<string[]>([]);

  const addAnime = (anime: string) => {
    setAnimeList([...animeList, anime]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <header className="w-full p-4 bg-blue-600 text-white text-center text-2xl font-bold">
        Anime Recommender
      </header>

      <main className="flex flex-col items-center mt-16">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Find Your Next Favorite Anime
        </h1>
        <p className="mt-4 text-gray-700 text-lg text-center max-w-xl">
          Tell us what you watched recently and what you liked about it,
          and we’ll suggest new anime tailored for you!
        </p>

        {/* Anime Input Component */}
        <AnimeInput onAddAnime={addAnime} />

        {/* Display added anime */}
        {animeList.length > 0 && (
          <div className="mt-6 w-80">
            <h2 className="text-lg font-semibold mb-2">Anime You Added:</h2>
            <ul className="list-disc list-inside">
              {animeList.map((anime, index) => (
                <li key={index}>{anime}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Questionnaire Button */}
        {animeList.length > 0 && (
          <Link
            to="/questionnaire"
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Start Questionnaire
          </Link>
        )}
      </main>
    </div>
  );
}
