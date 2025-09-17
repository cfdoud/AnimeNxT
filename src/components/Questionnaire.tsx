import type { AnimeItem } from "../pages/home";
import '../App.css'; // import the CSS file we'll use

interface Props {
  animeList: AnimeItem[];
  answers: { [anime: string]: string };
  saveAnswer: (anime: string, answer: string) => void;
}

export default function Questionnaire({ animeList, answers, saveAnswer }: Props) {
  return (
    <div className="questionnaire-container">
      <h2>Questions</h2>
      {animeList.map((anime) => (
        <div key={anime.name} className="question-card">
          <img src={anime.image} alt={anime.name} />
          <div className="question-content">
            <p>What did you like about "{anime.name}"?</p>
            <input
              type="text"
              value={answers[anime.name] || ""}
              onChange={(e) => saveAnswer(anime.name, e.target.value)}
              placeholder="Type your answer..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}
