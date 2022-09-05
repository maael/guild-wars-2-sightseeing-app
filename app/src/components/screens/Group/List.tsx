import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
      <div className="grid grid-cols-2 gap-2 max-w-3xl mx-auto">
        {data?.docs.map((d) => (
          <Item key={d._id} item={d} />
        ))}
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
        {item.name} - {item.difficulty} - {item.items?.length || 0} items -{" "}
        {item.rating.avg} ({item.rating.count}) - {item.creator.accountName}
      </div>
    </Link>
  );
}
