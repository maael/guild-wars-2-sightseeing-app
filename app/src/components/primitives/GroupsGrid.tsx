import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import cls from "classnames";
import { HomeGroup } from "../../types";
import { getAvatar } from "../../util";
import Difficulty from "./Difficulty";
import Rating from "./Rating";

export default function GroupsGrid({
  items,
  emptyMessage,
}: {
  emptyMessage: React.ReactNode;
  items?: HomeGroup[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pt-2 pb-6 px-2">
      {items && items.length > 0 ? (
        items.map((d) => <Item key={d._id} item={d} />)
      ) : (
        <p className="text-center text-base mx-2 w-full col-span-1 sm:col-span-2">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function Item({ item }: { item?: HomeGroup }) {
  const isDone = item?.completion?.count === item?.itemCount;
  return (
    <Link to={`/groups/${item?._id}`}>
      <div
        style={{
          backgroundImage: "url(/ui/windowbg-glyphs.png)",
          backgroundSize: "100% 100%",
        }}
        className="h-28 bg-no-repeat bg-top relative pb-1 px-1 transition-transform hover:scale-105 gwcursor-btn cursor-pointer"
      >
        <div
          className={cls("p-2 flex flex-col gap-1 h-full", {
            "opacity-60": isDone,
          })}
        >
          <div className="flex flex-row gap-2 justify-center items-center">
            <div className="flex-1 text-lg">{item?.name}</div>
            <Difficulty level={item?.difficulty} />
            <Rating rating={item?.ratings} />
          </div>
          <div className="flex-1">{item?.description}</div>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div>
              {item?.completion?.count || 0} of {item?.itemCount} items
            </div>
            <div className="flex flex-row gap-1 justify-center items-center">
              <img
                src={getAvatar(item?.creator.accountName)}
                className="rounded-full w-5 h-5"
              />
              {item?.creator.accountName}
            </div>
          </div>
        </div>
        {isDone ? (
          <div className="absolute inset-0 flex justify-center items-center text-4xl">
            <FaCheckCircle className="text-green-600" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
