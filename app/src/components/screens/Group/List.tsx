import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaClock, FaSpinner, FaStar } from "react-icons/fa";
import cls from "classnames";
import * as Sentry from "@sentry/react";
import { GroupDocument, PaginateResult, WithRating } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import { API_URL, fetchWithKey, getAvatar } from "../../../util";
import Difficulty from "../../primitives/Difficulty";
import Rating from "../../primitives/Rating";
import Button from "../../primitives/Button";

export default function GroupListScreen() {
  const [groupSort, setGroupSort] = useState("recent");
  const { isLoading, error, data } = useQuery(
    ["groups"],
    () =>
      fetchWithKey<PaginateResult<WithRating<GroupDocument>>>(
        `${API_URL}/api/groups`
      ).then((res) => res.data),
    {
      onError: (e) => {
        console.info("[groups:error]", e);
        Sentry.captureException(e);
      },
    }
  );

  const { data: completions } = useQuery(
    ["completions"],
    () =>
      fetchWithKey<WithRating<GroupDocument>[]>(
        `${API_URL}/api/completions`
      ).then((res) => res.data),
    {
      onError: (e) => {
        console.info("[completions:error]", e);
        Sentry.captureException(e);
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-3xl">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-700 mx-2">
        {`An error has occurred: ${error as Error}, ${(error as Error).stack}}`}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        hideBack
        className="pt-12 sm:pt-0 mb-2"
        rightAction={
          <Link to="/groups/new" className="opacity-70 hover:opacity-100">
            <Button className="flex flex-row justify-center items-center -left-3">
              <div
                className="h-14 w-14 -ml-4 -mr-3 -my-4 cursor-pointer bg-no-repeat bg-cover bg-center"
                style={{
                  backgroundImage: "url(/ui/new.png)",
                }}
              ></div>
              New Log
            </Button>
          </Link>
        }
      >
        <span>
          <span className="hidden sm:inline">Guild Wars 2</span> Sightseeing
        </span>
      </PageHeader>
      <h2 className="text-center text-2xl mb-1 capitalize">
        {`Your active logs (${completions?.length})`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pb-5 px-2">
        {!completions || completions.length === 0 ? (
          <p className="text-center text-sm mx-2 w-full col-span-1 sm:col-span-2">
            Any logs you've started or completed will appear here, find some
            below!
          </p>
        ) : (
          completions?.map((d) => (
            <Item
              key={d._id}
              item={d}
              completedItems={(d as any).completedItems?.length}
            />
          ))
        )}
      </div>
      <h2 className="text-center text-2xl mb-1 capitalize">
        {`Your created logs (${completions?.length})`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pb-2 px-2">
        <p className="text-center text-sm mx-2 w-full col-span-1 sm:col-span-2">
          Any logs you've created or completed will appear here.
        </p>
      </div>
      <h2 className="text-center text-2xl mb-1 capitalize">{groupSort} logs</h2>
      <div className="flex flex-row justify-center uppercase max-w-sm w-5/6 mx-auto">
        <button
          onClick={() => setGroupSort("recent")}
          className={cls(
            "px-5 py-1.5 transition-transform hover:scale-110 rounded-l-lg cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2 text-sm sm:text-base",
            {
              "bg-brown-light": groupSort === "recent",
              "bg-brown-dark": groupSort === "top",
            }
          )}
        >
          <FaClock /> Recent
        </button>
        <button
          onClick={() => setGroupSort("top")}
          className={cls(
            "px-5 py-1.5 transition-transform hover:scale-110 rounded-r-lg cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2 text-sm sm:text-base",
            {
              "bg-brown-light": groupSort === "top",
              "bg-brown-dark": groupSort === "recent",
            }
          )}
        >
          <FaStar /> Top
        </button>
      </div>
      <h3 className="text-center text-xl my-2">
        {data?.docs.length} of {data?.totalDocs}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pb-10 px-2">
        {data?.docs && data?.docs.length > 0 ? (
          data?.docs.map((d) => (
            <Item
              key={d._id}
              item={d}
              completedItems={(d as any).completedItems?.length}
            />
          ))
        ) : (
          <p className="text-center text-sm mx-2 w-full col-span-1 sm:col-span-2">
            Logs that you can complete will be here!
          </p>
        )}
      </div>
    </div>
  );
}

function Item({
  item,
  completedItems = 0,
}: {
  item: WithRating<GroupDocument>;
  completedItems: number;
}) {
  const isDone = completedItems === item.items?.length;
  return (
    <Link to={`/groups/${item._id}`}>
      <div
        style={{
          backgroundImage: "url(/ui/windowbg-glyphs.png)",
          backgroundSize: "100% 100%",
        }}
        className="h-28 bg-no-repeat bg-top relative pb-1 px-1"
      >
        <div
          className={cls("p-2 flex flex-col gap-1 h-full", {
            "opacity-60": isDone,
          })}
        >
          <div className="flex flex-row gap-2 justify-center items-center">
            <div className="flex-1 text-lg">{item.name}</div>
            <Difficulty level={item.difficulty} />
            <Rating rating={item.rating} />
          </div>
          <div className="flex-1">{item.description}</div>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div>
              {completedItems} of {item.items?.length || 0} items
            </div>
            <div>{item.expansions.join(",")}</div>
            <div className="flex flex-row gap-1 justify-center items-center">
              <img
                src={getAvatar(item.creator.accountName)}
                className="rounded-full w-5 h-5"
              />
              {item.creator.accountName}
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
