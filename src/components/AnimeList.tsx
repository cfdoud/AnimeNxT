import type { AnimeItem } from "../pages/home";
import '../App.css';


interface Props {
<<<<<<< Updated upstream
  animeList: AniListMedia[];
=======
  animeList: AnimeItem[];
  onRecommend: () => void;
>>>>>>> Stashed changes
}

export default function AnimeList({ animeList, onRecommend }: Props) {
  if (animeList.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <h2 className="text-sm font-semibold mb-2">Anime You Added:</h2>
<<<<<<< Updated upstream
      <ul className="list-none">
        {animeList.map((anime, i) => (
          <li 
            key={i} 
            className="flex items-center gap-2 mb-2 bg-white p-2 rounded shadow"
          >
          <img  
            src={anime.coverImage.large} 
            alt={anime.title.romaji} 
            className="w-5 h-5 rounded" 
          />
            <span>{anime.title.english || anime.title.romaji}</span>
          </li>
        ))}
=======
      <ul className="anime-list list-none">
        {animeList.map((anime, i) => {
          const imageSrc =
            typeof anime.coverImage === "string"
            ? anime.coverImage 
            : anime.coverImage?.large || "";
          const titleText = 
            typeof anime.title === "string" 
            ? anime.title 
            : (typeof anime.title?.english === "string"
            ? anime.title.english 
            : typeof anime.title?.romaji === "string" 
            ? anime.title.romaji 
            : "Untitled");

          return (
            <li 
              key={i} 
              className="flex items-center gap-2 mb-2 bg-white p-2 rounded shadow hover:bg-gray-50 transition"
            >
              <img  
                src={imageSrc} 
                alt={titleText} 
                className="w-10 h-10 rounded object-cover" 
              />
              <span className="text-gray-800">{titleText}</span>
            </li>
          );
        })}
>>>>>>> Stashed changes
      </ul>
      <div>
        <button onClick={onRecommend} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Get Recommendations
        </button>
      </div>
    </div>
  );
}
