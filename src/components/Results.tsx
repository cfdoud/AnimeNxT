// src/pages/Results.tsx
import { useLocation } from "react-router-dom";

export default function ResultsPage() {
  const location = useLocation();
  const animeList = location.state?.animeList || [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Recommended Anime
      </h1>
      {animeList.length > 0 ? (
        <div className="w-80">
          <h2 className="text-lg font-semibold mb-2">You added:</h2>
          <ul className="list-disc list-inside">
            {animeList.map((anime: string, i: number) => (
              <li key={i}>{anime}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-700">No anime provided yet.</p>
      )}
    </div>
  );
}
