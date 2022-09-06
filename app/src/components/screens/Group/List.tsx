import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaStar, FaUser } from "react-icons/fa";
import { GroupDocument, PaginateResult, WithRating } from "../../../types";
import PageHeader from "../../primitives/PageHeader";

export default function GroupListScreen() {
  const { isLoading, error, data } = useQuery<
    PaginateResult<WithRating<GroupDocument>>
  >(["groups"], () =>
    fetch("http://localhost:3000/api/groups").then((res) => res.json())
  );

  if (isLoading) return <div>"Loading...";</div>;

  if (error)
    return <div>"An error has occurred: " + (error as Error).message</div>;

  return (
    <div>
      <PageHeader>
        <>
          List ({data?.docs.length}/{data?.totalDocs})
        </>
      </PageHeader>
      <Link to="/groups/new" className="opacity-70 hover:opacity-100">
        <div className="flex flex-row justify-center items-center">
          <div
            className="h-14 w-14 -mr-2 cursor-pointer bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage: "url(/ui/new.png)",
            }}
          ></div>
          New
        </div>
      </Link>
      <div className="grid grid-cols-2 gap-2 max-w-3xl mx-auto pb-10">
        {data?.docs.map((d) => (
          <Item key={d._id} item={d} />
        ))}
      </div>
    </div>
  );
}

const difficultyMap: { [k: number]: { label: string; colour: string } } = {
  1: { label: "Beginner", colour: "bg-green-400" },
  2: { label: "Easy", colour: "bg-green-600" },
  3: { label: "Medium", colour: "bg-orange-500" },
  5: { label: "Hard", colour: "bg-red-600" },
  6: { label: "Expert", colour: "bg-red-800" },
};
function Difficulty({ level }: { level: number }) {
  return (
    <div className="flex flex-row">
      <div
        className={`${difficultyMap[level]?.colour} px-1.5 py-0.5 text-xs rounded-md`}
      >
        {difficultyMap[level]?.label || "Unknown"}
      </div>
    </div>
  );
}

function Item({ item }: { item: WithRating<GroupDocument> }) {
  return (
    <Link to={`/groups/${item._id}`}>
      <div
        style={{
          backgroundImage: "url(/ui/windowbg-glyphs.png)",
          backgroundSize: "100%",
        }}
        className="h-28 bg-no-repeat bg-top"
      >
        <div className="p-2 flex flex-col gap-1 h-full">
          <div className="flex flex-row gap-2 justify-center items-center">
            <div className="flex-1 text-lg">{item.name}</div>
            <Difficulty level={item.difficulty} />
            <div className="flex flex-row gap-2">
              <FaStar /> {item.rating.avg} ({item.rating.count})
            </div>
          </div>
          <div className="flex-1">{item.description}</div>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div>{item.items?.length || 0} items</div>
            <div>{item.expansions.join(",")}</div>
            <div className="flex flex-row gap-2">
              <FaUser /> {item.creator.accountName}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
