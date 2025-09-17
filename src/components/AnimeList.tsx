import type { AnimeItem } from "../pages/home";
import '../App.css';


interface Props {
  animeList: AnimeItem[];
}

export default function AnimeList({ animeList }: Props) {
  if (animeList.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <h2 className="text-sm font-semibold mb-2">Anime You Added:</h2>
      <ul className="anime-list">
  {animeList.map((anime, i) => (
    <li key={i}>
      <img src={anime.image} alt={anime.name} />
      <span>{anime.name}</span>
    </li>
  ))}
</ul>
    </div>
  );
}
