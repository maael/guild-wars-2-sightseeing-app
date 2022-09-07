const difficultyMap: { [k: number]: { label: string; colour: string } } = {
  1: { label: "Beginner", colour: "bg-green-400" },
  2: { label: "Easy", colour: "bg-green-600" },
  3: { label: "Medium", colour: "bg-orange-500" },
  5: { label: "Hard", colour: "bg-red-600" },
  6: { label: "Expert", colour: "bg-red-800" },
};

export default function Difficulty({ level }: { level?: number }) {
  return (
    <div className="flex flex-row">
      <div
        className={`${
          difficultyMap[level!]?.colour
        } px-1.5 py-0.5 text-xs rounded-md`}
      >
        {difficultyMap[level!]?.label || "Unknown"}
      </div>
    </div>
  );
}
