import { useState, useEffect } from "react";
import type { AniListMedia } from "../types";
import { searchAnime } from "../api/anilist";

interface Props {
  onAddAnime: (anime: AniListMedia) => void;
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function AnimeInput({ onAddAnime }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AniListMedia[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    const searchTerm = debouncedInput.trim();
    if (!searchTerm) { setSuggestions([]); return; }

    let cancelled = false;
    async function run() {
      try {
        const results = await searchAnime(searchTerm, 5);
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [debouncedInput]);

  const handleSelect = (anime: AniListMedia) => {
    onAddAnime(anime);
    setInput("");
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
        isFocused
          ? "border-indigo-500/60 bg-indigo-950/30 shadow-lg shadow-indigo-900/20"
          : "border-white/10 bg-white/5"
      }`}>
        <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Search anime..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
        {input && (
          <button onClick={() => { setInput(""); setSuggestions([]); }}
            className="text-white/20 hover:text-white/50 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-white/10 bg-[#0f0f1e]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {suggestions.map((s, i) => {
            const title = s.title.english || s.title.romaji;
            return (
              <li
                key={s.id}
                onClick={() => handleSelect(s)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-indigo-500/10 ${
                  i !== suggestions.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <img
                  src={s.coverImage.large}
                  alt={title}
                  className="w-8 h-11 object-cover rounded-md shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-white/90 font-medium truncate">{title}</p>
                  {s.genres?.length > 0 && (
                    <p className="text-xs text-white/30 truncate mt-0.5">
                      {s.genres.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
