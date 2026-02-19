import { useState, useEffect } from "react";
import type { Recommendation } from "../utils/recommender";
import { Heart, HeartFill, XLg } from "react-bootstrap-icons";
import {getNewAnimeFromAlgorithm} from "../api/recommender";
interface ResultsProps {
  recommendations: Recommendation[];
  onRecommend: () => Promise<Recommendation[]>; // async fetch function

}



export default function Results({ recommendations, onRecommend }: ResultsProps) {

  const handSize = 5; // number of anime visible at once

  // Internal state
  const [deck, setDeck] = useState<Recommendation[]>([]);
  const [visibleAnime, setVisibleAnime] = useState<Recommendation[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [perished, setPerished] = useState<Set<number>>(new Set());
  const [nextIndex, setNextIndex] = useState(0); // cursor into deck

  // Initialize hand whenever recommendations change
  useEffect(() => {
    setDeck(recommendations);
    setVisibleAnime(recommendations.slice(0, handSize));
    setNextIndex(handSize);
    setPerished(new Set());
    setFavorites(new Set());
  }, [recommendations]);



  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Get next unseen anime from the deck
  const getNextUnseen = async (needed: number, currentVisible: Recommendation[]) => {
    const newItems: Recommendation[] = [];
    let cursor = nextIndex;

    while (newItems.length < needed) {
      if (cursor >= deck.length) {
        // Deck exhausted → fetch more
        const newRecs = await onRecommend();
        if (!Array.isArray(newRecs) || newRecs.length === 0) break; // stop if nothing returned
        setDeck(prev => [...prev, ...newRecs]);
      }

      const candidate = deck[cursor];
      if (!candidate) break; // safety check

      if (!perished.has(candidate.anime.id) &&
          !currentVisible.some(v => v.anime.id === candidate.anime.id)) {
        newItems.push(candidate);
      }
      cursor++;
    }

    setNextIndex(cursor);
    return newItems;
  };



  // Slash single anime
const slashAnime = async (id: number) => {
  // Remove the slashed anime
  const remaining = visibleAnime.filter(r => r.anime.id !== id);

  // Add to perished
  setPerished(p => new Set([...p, id]));

  // Fetch 1 replacement from deck (or fetch more if deck is empty)
  const replacements = await getNextUnseen(1, remaining);

  // Update visibleAnime with new hand
  setVisibleAnime([...remaining, ...replacements]);
};


  // Heart list (keep favorites, replace others)
  const heartList = async () => {
    const kept = visibleAnime.filter(r => favorites.has(r.anime.id));
    const removedIds = visibleAnime.filter(r => !favorites.has(r.anime.id)).map(r => r.anime.id);
    setPerished(p => new Set([...p, ...removedIds]));

    const replacements = await getNextUnseen(visibleAnime.length - kept.length, kept);

    setVisibleAnime([...kept, ...replacements]);
  };



  if (!recommendations.length) return null;

  return (
    <div className="mt-6 w-full">
      <h3 className="text-xl font-semibold mb-2 text-textPrimary dark:text-textPrimary">
        Recommended for you:
      </h3>
      <ul className="list-none flex flex-col gap-4">
        {visibleAnime.map(r => {
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

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => toggleFavorite(r.anime.id)}
                  className="p-1 rounded-full hover:bg-accentHover transition"
                >
                  {isFavorite ? (
                    <HeartFill className="text-red-500 w-5 h-5" />
                  ) : (
                    <Heart className="text-gray-400 dark:text-textSecondary w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => slashAnime(r.anime.id)}
                  className="px-2 py-1 bg-gray-900 text-red-500 rounded hover:bg-gray-800 transition"
                >
                  <XLg className="w-5 h-5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => heartList()}
        className="mt-4 px-4 py-2 bg-gray-900 text-red-500 rounded hover:bg-gray-800 transition"
      >
        Send to Filler Hell 🔥
      </button>
    </div>
  );
}
