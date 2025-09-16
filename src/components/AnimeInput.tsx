import { useState } from "react";

interface AnimeInputProps {
  onAddAnime: (anime: string) => void;
}

export default function AnimeInput({ onAddAnime }: AnimeInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "") {
      onAddAnime(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter an anime"
        className="border p-2 rounded w-64"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  );
}
