import { useState } from "react";
import type { Recommendation } from "../utils/recommender";
import { Heart, HeartFill, Nvidia, XLg } from "react-bootstrap-icons"; 
interface ResultsProps {
  recommendations: Recommendation[];
}

export default function Results({ recommendations }: ResultsProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [visibleAnime, setVisibleAnime] = useState<Recommendation[]>(recommendations);
  const [perished, setPerished] = useState<Recommendation[]>([]);
  {/* Toggle favorite status for a recommendation and kill others*/}
  const toggleFavorite = (id: number) => {
  setFavorites((prev) => {
    const newSet = new Set(prev);

    newSet.has(id) ? newSet.delete(id) : newSet.add(id);

    const oldFavs = Array.from(prev).filter((favId) => favId !== id);

    console.log(
      "Toggled favorite:",
      id,
      "New favorites set:",
      newSet,
      "Old favorites:",
      oldFavs
    );

    return newSet;
    });
  };

  const perishList = () => {
    setVisibleAnime((prev) => {
      const kept = prev.filter(r => favorites.has(r.anime.id));
      const removedIds = prev.filter(r => !favorites.has(r.anime.id)).map(r => r.anime.id);
      setPerished(p => new Set([...p, ...removedIds]));

      const needed = prev.length - kept.length;
      const replacements = recommendations.filter(r => !favorites.has(r.anime.id) && !removedIds.includes(r.anime.id)).slice(0, needed);
      return [...kept, ...replacements];
    });
  };


  if (!recommendations.length) return null;

  return (
    <div className="mt-6 w-full">
      <h3 className="text-xl font-semibold mb-2 text-textPrimary dark:text-textPrimary">
        Recommended for you:
      </h3>
      <ul className="list-none flex flex-col gap-4">
        {recommendations.map((r) => {
          const titleText =
            typeof r.anime.title === "string"
              ? r.anime.title
              : r.anime.title?.english || r.anime.title?.romaji || "Untitled";

          const isFavorite = favorites.has(r.anime.id);

          return (
            <li
              key={r.anime.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-cardDark shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                {r.anime.coverImage && (
                  <img
                    src={r.anime.coverImage}
                    alt={titleText}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-textPrimary">
                    {titleText}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-textSecondary">
                    Score: {r.score.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Remove toggle */}
              <button
                onClick={() => toggleFavorite(r.anime.id)}
                className="p-1 rounded-full hover:bg-accentHover transition"
              >
                {isFavorite ? (
                  <HeartFill className="text-error w-5 h-5" />
                ) : (
                  <Heart className="text-gray-400 dark:text-textSecondary w-5 h-5" />
                )}
              </button>
              
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => perishList()}
        className="mt-4 px-4 py-2 bg-gray-900 text-red-500 rounded hover:bg-gray-800 transition"
        > 
        Send to Filler Hell 🔥
      </button>
    </div>
  );
}
