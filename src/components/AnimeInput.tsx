import { useState, useEffect } from "react";
import type { AnimeItem } from "../pages/home";

interface Props {
  onAddAnime: (name: string, image: string) => void;
}

interface AniListMedia {
  id: number;
  title: { romaji: string; english?: string };
  coverImage: { large: string };
}

export default function AnimeInput({ onAddAnime }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AniListMedia[]>([]);

  useEffect(() => {
    if (input.trim() === "") {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const query = `
        query ($search: String) {
          Page(perPage: 5) {
            media(search: $search, type: ANIME) {
              id
              title { romaji english }
              coverImage { large }
            }
          }
        }
      `;
      const variables = { search: input };
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const data = await res.json();
      setSuggestions(data.data.Page.media);
    };

    fetchSuggestions();
  }, [input]);

  const handleSelect = (anime: AniListMedia) => {
    onAddAnime(anime.title.english || anime.title.romaji, anime.coverImage.large);
    setInput("");
    setSuggestions([]);
  };

  return (
    <div className="relative mt-4 w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter anime name"
        className="border rounded px-4 py-2 w-full"
      />

      {suggestions.length > 0 && (
        <ul className="absolute bg-white border mt-1 w-full z-10 max-h-40 overflow-y-auto rounded shadow">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="flex items-center px-2 py-1 hover:bg-gray-200 cursor-pointer gap-2"
              onClick={() => handleSelect(s)}
            >
              <img src={s.coverImage.large} alt={s.title.romaji} className="w-5 h-11 object-cover rounded" />
              <span>{s.title.english || s.title.romaji}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
