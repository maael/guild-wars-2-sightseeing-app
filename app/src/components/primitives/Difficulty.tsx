export const difficultyMap: {
  [k: number]: { label: string; colour: string; border: string };
} = {
  1: { label: "Beginner", colour: "bg-green-500", border: "border-green-500" },
  2: { label: "Easy", colour: "bg-green-600", border: "border-green-600" },
  3: { label: "Medium", colour: "bg-orange-500", border: "border-orange-500" },
  5: { label: "Hard", colour: "bg-red-600", border: "border-red-600" },
  6: { label: "Expert", colour: "bg-red-800", border: "border-red-800" },
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
