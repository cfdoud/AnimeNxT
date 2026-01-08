import "../App.css";
import type { Recommendation } from "../utils/recommender";

interface ResultsProps {
  recommendations: Recommendation[];
}

export default function Results({ recommendations }: ResultsProps) {
  if (!recommendations.length) return null;

  return (
    
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">
        Recommended for you
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.map((r) => {
          const rawTitle = r.anime.title as any;
          const titleText =
            typeof rawTitle === "string"
              ? rawTitle
              : rawTitle?.english ||
                rawTitle?.romaji ||
                "Untitled";

          return (
            <div
              key={r.anime.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] transition"
            >
              {r.anime.coverImage && (
                <img
                  src={r.anime.coverImage}
                  alt={titleText}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-3">
                <h3 className="font-medium text-slate-100">
                  {titleText}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Match score: {r.score.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
