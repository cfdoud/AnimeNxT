import { useState, useEffect } from "react";
// import type { AnimeItem } from "../pages/home";   
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

  // Debounced input to avoid unnecessary API calls
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    const searchTerm = debouncedInput.trim();
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    console.log("Searching AniList for:", searchTerm);

    let cancelled = false;
    
    async function run() {
      try {
        const results = await searchAnime(searchTerm, 5);
        if (!cancelled) setSuggestions(results);
      } catch (err) {
        console.error("AniList search error:", err);
        if (!cancelled) setSuggestions([]);
      }
    }

    run();
    // Fetch AniList results
    // const fetchResults = async () => {
    //   try {
    //     const query = `
    //       query ($search: String) {
    //         Page(perPage: 5) {
    //           media(search: $search, type: ANIME) {
    //             id
    //             coverImage {
    //               large
    //             }
    //             title {
    //               romaji
    //               english
    //             }

    //             relations {
    //               edges {
    //                 relationType
    //                 node {
    //                   id
    //                   title {
    //                     romaji
    //                     english
    //                   }
    //                   format
    //                   season
    //                   seasonYear
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     `;
    //     const variables = { search: searchTerm };

    //     const res = await fetch("/anilist", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json", Accept: "application/json" },
    //       body: JSON.stringify({ query, variables }),
    //     });
    //     const data = await res.json();
    //     setSuggestions(data.data?.Page?.media || []);
    //   } catch (err) {
    //     console.error("AniList fetch error:", err);
    //     setSuggestions([]);
    //   }
    // };

    // fetchResults();
    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

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
