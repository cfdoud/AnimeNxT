import { useState, useEffect, useRef } from "react";
import type { Recommendation } from "../utils/recommender";

interface ResultsProps {
  recommendations: Recommendation[];
  onRecommend: () => Promise<Recommendation[]>;
}

// Individual card with slash animation
function AnimeCard({
  rec,
  isFavorite,
  onFavorite,
  onSlash,
  disabled,
}: {
  rec: Recommendation;
  isFavorite: boolean;
  onFavorite: () => void;
  onSlash: () => void;
  disabled: boolean;
}) {
  const [slashing, setSlashing] = useState(false);
  const [exiting, setExiting] = useState(false);

  const titleText =
    typeof rec.anime.title === "string"
      ? rec.anime.title
      : (rec.anime.title as any)?.english ||
        (rec.anime.title as any)?.romaji ||
        "Untitled";

  const handleSlash = async () => {
    if (disabled || slashing) return;
    setSlashing(true);
    // Wait for slash line animation
    await new Promise((r) => setTimeout(r, 350));
    setExiting(true);
    // Wait for exit animation
    await new Promise((r) => setTimeout(r, 250));
    onSlash();
  };

  return (
    <li
      className={`relative flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/3 overflow-hidden transition-all duration-250 ${
        exiting ? "opacity-0 scale-95 -translate-x-4" : "opacity-100 scale-100"
      }`}
    >
      {/* Slash line overlay */}
      {slashing && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(239,68,68,0.15) 50%, transparent 60%)",
          }}
        >
          {/* The slash line itself */}
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
            style={{
              width: "100%",
              transform: "translateY(-50%) rotate(-3deg)",
              animation: "slashLine 0.35s ease-out forwards",
            }}
          />
        </div>
      )}

      {/* Cover image */}
      {rec.anime.coverImage && (
        <img
          src={rec.anime.coverImage}
          alt={titleText}
          className="w-10 h-14 object-cover rounded-lg shrink-0"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{titleText}</p>
        <p className="text-xs text-white/30 mt-0.5">
          Match: {(rec.score * 100).toFixed(1)}%
        </p>
        {Array.isArray((rec.anime as any).genres) && (
          <p className="text-xs text-indigo-400/60 mt-0.5 truncate">
            {((rec.anime as any).genres as string[]).slice(0, 2).join(" · ")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={onFavorite}
          disabled={disabled}
          title="Keep"
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
            isFavorite
              ? "bg-red-500/20 text-red-400 scale-110"
              : "bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
          }`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <button
          onClick={handleSlash}
          disabled={disabled || slashing}
          title="Slash"
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slashLine {
          from { transform: translateY(-50%) rotate(-3deg) scaleX(0); transform-origin: left; }
          to   { transform: translateY(-50%) rotate(-3deg) scaleX(1); transform-origin: left; }
        }
      `}</style>
    </li>
  );
}

export default function Results({ recommendations, onRecommend }: ResultsProps) {
  const handSize = 5;

  const [visibleAnime, setVisibleAnime] = useState<Recommendation[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const deckRef = useRef<Recommendation[]>([]);
  const nextIndexRef = useRef(0);
  const perishedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    deckRef.current = recommendations;
    nextIndexRef.current = handSize;
    perishedRef.current = new Set();
    setFavorites(new Set());
    setVisibleAnime(recommendations.slice(0, handSize));
  }, [recommendations]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getNextUnseen = async (needed: number, currentVisible: Recommendation[]) => {
    const newItems: Recommendation[] = [];

    while (newItems.length < needed) {
      if (nextIndexRef.current >= deckRef.current.length) {
        const newRecs = await onRecommend();
        if (!Array.isArray(newRecs) || newRecs.length === 0) break;
        deckRef.current = [...deckRef.current, ...newRecs];
      }

      const candidate = deckRef.current[nextIndexRef.current];
      if (!candidate) break;
      nextIndexRef.current++;

      if (
        !perishedRef.current.has(candidate.anime.id) &&
        !currentVisible.some((v) => v.anime.id === candidate.anime.id)
      ) {
        newItems.push(candidate);
      }
    }

    return newItems;
  };

  const slashAnime = async (id: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const remaining = visibleAnime.filter((r) => r.anime.id !== id);
    perishedRef.current = new Set([...perishedRef.current, id]);
    const replacements = await getNextUnseen(1, remaining);
    setVisibleAnime([...remaining, ...replacements]);
    setIsProcessing(false);
  };

  const heartList = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const kept = visibleAnime.filter((r) => favorites.has(r.anime.id));
    const removedIds = visibleAnime
      .filter((r) => !favorites.has(r.anime.id))
      .map((r) => r.anime.id);
    perishedRef.current = new Set([...perishedRef.current, ...removedIds]);
    const replacements = await getNextUnseen(visibleAnime.length - kept.length, kept);
    setVisibleAnime([...kept, ...replacements]);
    setIsProcessing(false);
  };

  if (!recommendations.length) return null;

  const favoriteCount = visibleAnime.filter((r) => favorites.has(r.anime.id)).length;

  return (
    <div className="w-full">
      <ul className="flex flex-col gap-2">
        {visibleAnime.map((r) => (
          <AnimeCard
            key={r.anime.id}
            rec={r}
            isFavorite={favorites.has(r.anime.id)}
            onFavorite={() => toggleFavorite(r.anime.id)}
            onSlash={() => slashAnime(r.anime.id)}
            disabled={isProcessing}
          />
        ))}
      </ul>

      {visibleAnime.length === 0 && (
        <div className="py-10 text-center text-white/20 text-sm">
          No more recommendations available.
        </div>
      )}

      {visibleAnime.length > 0 && (
        <button
          onClick={heartList}
          disabled={isProcessing || favoriteCount === 0}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
            favoriteCount > 0
              ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20"
              : "bg-white/3 text-white/15 cursor-not-allowed border border-white/5"
          }`}
        >
          {favoriteCount > 0
            ? `Send to Filler Hell 🔥 (keep ${favoriteCount})`
            : "Heart anime to keep them →"}
        </button>
      )}
    </div>
  );
}
