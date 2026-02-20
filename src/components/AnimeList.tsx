import { useState, useEffect } from "react";
import type { AnimeItem } from "../pages/home";
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

function SortableAnimeItem({ anime, id, rank }: { anime: AnimeItem; id: string; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageSrc = typeof anime.coverImage === "string"
    ? anime.coverImage
    : anime.coverImage?.large || "";
  const titleText = typeof anime.title === "string"
    ? anime.title
    : (anime.title?.english || anime.title?.romaji || "Untitled");

  const rankColors: Record<number, string> = {
    1: "text-yellow-400",
    2: "text-slate-300",
    3: "text-amber-600",
    4: "text-white/40",
    5: "text-white/40",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? "border-indigo-500/50 bg-indigo-950/50 shadow-lg shadow-indigo-900/30 scale-[1.02] z-50"
          : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"
      }`}
    >
      <span className={`text-xs font-black w-4 text-center shrink-0 ${rankColors[rank] || "text-white/40"}`}>
        {rank}
      </span>
      <img src={imageSrc} alt={titleText} className="w-9 h-12 rounded-lg object-cover shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/90 font-medium truncate">{titleText}</p>
        {Array.isArray((anime as any).genres) && (anime as any).genres.length > 0 && (
          <p className="text-xs text-white/25 truncate mt-0.5">
            {(anime as any).genres.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
      {/* drag handle indicator */}
      <div className="shrink-0 flex flex-col gap-0.5 pr-1 opacity-20">
        {[0,1,2].map(i => (
          <div key={i} className="w-3 h-0.5 bg-white rounded-full" />
        ))}
      </div>
    </li>
  );
}

export default function AnimeList({ animeList, onRecommend }: Props) {
  const [internalList, setInternalList] = useState<AnimeItem[]>(animeList);

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
      setInternalList(arrayMove(internalList, oldIndex, newIndex));
    }
  };

  const isReady = internalList.length === 5;

  return (
    <div className="mt-4 w-full">
      {internalList.length > 0 && (
        <>
          <p className="text-xs text-white/20 mb-3 tracking-wide">
            Drag to rank · #1 weighs most
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={internalList.map((_, i) => String(i))}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {internalList.map((anime, i) => (
                  <SortableAnimeItem key={anime.id} anime={anime} id={String(i)} rank={i + 1} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}

      {internalList.length === 0 && (
        <div className="mt-4 text-center py-8 text-white/15 text-sm">
          Search for anime above to build your list
        </div>
      )}

      <button
        onClick={onRecommend}
        disabled={!isReady}
        className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
          isReady
            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/50"
            : "bg-white/5 text-white/20 cursor-not-allowed"
        }`}
      >
        {isReady ? "Get Recommendations →" : `Add ${5 - internalList.length} more anime`}
      </button>
    </div>
  );
}
