import type { AnimeItem } from "../pages/home";

interface Props {
  animeList: AnimeItem[];
}

export default function AnimeList({ animeList }: Props) {
  if (animeList.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <h2 className="text-sm font-semibold mb-2">Anime You Added:</h2>
      <ul className="list-none">
        {animeList.map((anime, i) => (
          <li key={i} className="flex items-center gap-2 mb-2 bg-white p-2 rounded shadow">
            <img  src={anime.image} alt={anime.name} className="w-5 h-5 rounded" />
            <span>{anime.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
