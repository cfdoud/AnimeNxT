import { useState, useEffect } from "react";
import type { AniListMedia } from "../types";

interface Props {
  onAddAnime: (anime: AniListMedia) => void;
}

export default function AnimeInput({ onAddAnime }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AniListMedia[]>([]);

  useEffect(() => {
    // Split input into words and only keep words >= 3 characters
    const validWords = input
      .trim()
      .split(/\s+/)
      .filter(word => word.length >= 3);

    if (validWords.length === 0) {
      setSuggestions([]);
      return;
    }

    // Use the last valid word for the search
    const searchTerm = validWords[validWords.length - 1];

    const debounce = setTimeout(async () => {
      try {
        const query = `
          query ($search: String) {
            Page(perPage: 5) {
              media(search: $search, type: ANIME) {
                id
                title { romaji english }
                coverImage { large }
                genres
                tags { name }
                description(asHtml: false)
                recommendations { edges { node { mediaRecommendation { id title { romaji english } coverImage { large } } } } }
                averageScore
              }
            }
          }
        `;
        const variables = { search: searchTerm };

        const res = await fetch("/anilist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query, variables }),
        });

        const data = await res.json();
        console.log("AniList API result:", data);

        if (!data.data || data.errors) {
          setSuggestions([]);
          return;
        }

        setSuggestions(data.data.Page.media);
      } catch (err) {
        console.error("AniList fetch error:", err);
        setSuggestions([]);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(debounce);
  }, [input]);

  const handleSelect = (anime: AniListMedia) => {
    onAddAnime(anime);
    setInput("");
    setSuggestions([]);
  };

  return (
    <div className="anime-input-container">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter Anime Name"
        className="border p-2 rounded w-full"
      />

      {suggestions.length > 0 && (
        <ul className="anime-suggestions mt-2 border rounded overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.id}
              onClick={() => handleSelect(s)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={s.coverImage.large}
                alt={s.title.romaji}
                className="w-10 h-10 object-cover rounded"
              />
              <span>{s.title.english || s.title.romaji}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
