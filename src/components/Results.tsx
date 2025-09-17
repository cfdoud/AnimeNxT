import '../App.css';
import { useLocation } from "react-router-dom";

export default function ResultsPage() {
  const location = useLocation();
  const animeList = location.state?.animeList || [];

  return (
    <div className="results-page">
      <h1>Recommended Anime</h1>
      {animeList.length > 0 ? (
        <div className="w-80">
          <h2>You added:</h2>
          <ul className="results-list">
            {animeList.map((anime: string, i: number) => (
              <li key={i}>{anime}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: "#374151" }}>No anime provided yet.</p>
      )}
    </div>
  );
}
