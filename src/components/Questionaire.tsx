import { useState } from "react";
import type { AniListMedia } from "../types";

interface Props {
  animeList: AniListMedia[];
  answers: { [anime: string]: string };
  saveAnswer: (anime: string, answer: string) => void;
}

export default function Questionnaire({ animeList, answers, saveAnswer }: Props) {
  return (
    <div className="mt-6 w-full">
      <h2 className="text-lg font-semibold mb-2">Questions</h2>
      {animeList.map((anime) => (
        <div key={anime.title.romaji} className="mb-4 p-4 border rounded bg-white shadow flex items-start gap-4">
          <img src={anime.coverImage.large} alt={anime.title.romaji} className="w-16 h-20 object-cover rounded" />
          <div className="flex-1">
            <p className="font-medium mb-2">What did you like about "{anime.title.english || anime.title.romaji}"?</p>
            <input
              type="text"
              value={answers[anime.title.english || anime.title.romaji] || ""}
              onChange={(e) => saveAnswer(anime.title.english || anime.title.romaji, e.target.value)}
              placeholder="Type your answer..."
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
