import { useState, useEffect } from "react";
import type { AnimeItem } from "../pages/home";
import '../App.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  animeList: AnimeItem[];
  onRecommend: () => void;
}

function SortableAnimeItem({ anime, id }: { anime: AnimeItem; id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  const imageSrc = typeof anime.coverImage === "string" ? anime.coverImage : anime.coverImage?.large || "";
  const titleText = typeof anime.title === "string" ? anime.title : (anime.title?.english || anime.title?.romaji || "Untitled");

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 mb-2 bg-white p-2 rounded shadow hover:bg-gray-50 transition"
    >
      <img src={imageSrc} alt={titleText} className="w-10 h-10 rounded object-cover" />
      <span className="text-gray-800">{titleText}</span>
    </li>
  );
}

export default function AnimeList({ animeList, onRecommend }: Props) {
  // Internal state to store the order and allow reordering
  const [internalList, setInternalList] = useState<AnimeItem[]>(animeList);
  console.log("Internal list:", internalList);
  // Keep internal list in sync when new anime are added via search or props update
  useEffect(() => {
    setInternalList(animeList);
  }, [animeList]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = internalList.findIndex((_, i) => String(i) === active.id);
      const newIndex = internalList.findIndex((_, i) => String(i) === over.id);
      const newList = arrayMove(internalList, oldIndex, newIndex);
      setInternalList(newList); // Update internal state
    }
  };

  if (internalList.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <h2 className="text-sm font-semibold mb-2">Anime You Added:</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={internalList.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
          <ul className="anime-list list-none">
            {internalList.map((anime, i) => (
              <SortableAnimeItem key={i} anime={anime} id={String(i)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <div>
        <button
          onClick={onRecommend}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Get Recommendations
        </button>
      </div>

    </div>
  );
}