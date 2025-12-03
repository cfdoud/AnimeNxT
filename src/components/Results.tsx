import "../App.css";
import type { Recommendation } from "../utils/recommender";

interface ResultsProps {
  recommendations: Recommendation[];
}

export default function Results({ recommendations }: ResultsProps) {
  if (!recommendations.length) return null; // don't show if empty

  return (
    <div className="mt-6 w-full">
      <h2 className="text-xl font-semibold mb-2">Recommended for you:</h2>
      <ul className="list-none">
        {recommendations.map((r) => {
          const rawTitle = r.anime.title as any;

          const titleText =
            typeof rawTitle === "string"
              ? rawTitle
              : rawTitle?.english ||
                rawTitle?.romaji ||
                "Untitled";

          return (
            <li
              key={r.anime.id}
              className="flex items-center gap-2 mb-2 bg-white p-2 rounded shadow"
            >
              <span className="font-medium text-gray-800">
                {titleText}
              </span>
              <span className="text-xs text-gray-500">
                score: {r.score.toFixed(3)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
