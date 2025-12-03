import { useState, useEffect } from "react";
import type { AnimeItem } from "../pages/home";   
import type { AniListMedia } from "../types";
interface Props {
  // onAddAnime: (name: string, image: string) => void;
  onAddAnime: (anime: AniListMedia) => void;
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
              genres
              tags { name }
              description(asHtml: false)
              recommendations { edges { node { mediaRecommendation { id title { romaji english } coverImage { large } } } } }
              averageScore
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
      console.log("AniList API result:", data); 
      setSuggestions(data.data.Page.media);
    };

    fetchSuggestions();
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
      />

      {suggestions.length > 0 && (
        <ul className="anime-suggestions">
          {suggestions.map((s) => (
            <li key={s.id} onClick={() => handleSelect(s)}>
              <img src={s.coverImage.large} alt={s.title.romaji} />
              <span>{s.title.english || s.title.romaji}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
