import { useState } from "react";
import type { AnimeItem } from "../pages/home"

interface Props {
  animeList: AnimeItem[];
  answers: { [anime: string]: string };
  saveAnswer: (anime: string, answer: string) => void;
}

export default function Questionnaire({ animeList, answers, saveAnswer }: Props) {
  return (
    <div className="mt-6 w-full">
      <h2 className="text-lg font-semibold mb-2">Questions</h2>
      {animeList.map((anime) => (
        <div key={anime.name} className="mb-4 p-4 border rounded bg-white shadow flex items-start gap-4">
          <img src={anime.image} alt={anime.name} className="w-16 h-20 object-cover rounded" />
          <div className="flex-1">
            <p className="font-medium mb-2">What did you like about "{anime.name}"?</p>
            <input
              type="text"
              value={answers[anime.name] || ""}
              onChange={(e) => saveAnswer(anime.name, e.target.value)}
              placeholder="Type your answer..."
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
