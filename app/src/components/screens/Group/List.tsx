import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaUser } from "react-icons/fa";
import cls from "classnames";
import * as Sentry from "@sentry/react";
import { GroupDocument, PaginateResult, WithRating } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import { API_URL, fetchWithKey } from "../../../util";
import Difficulty from "../../primitives/Difficulty";
import Rating from "../../primitives/Rating";
import Button from "../../primitives/Button";

export default function GroupListScreen() {
  const { isLoading, error, data } = useQuery(
    ["groups"],
    () =>
      fetchWithKey<PaginateResult<WithRating<GroupDocument>>>(
        `${API_URL}/api/groups`
      ).then((res) => res.data),
    {
      onError: (e) => {
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
        className="pt-12 sm:pt-0"
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
      <h2 className="text-center text-2xl mb-1">
        {`Your logs (${completions?.length})`}
      </h2>
      {!completions || completions.length === 0 ? (
        <p className="text-center text-sm mx-2">
          Any logs you've started or completed will appear here, find some
          below!
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pb-10 px-2">
        {completions?.map((d) => (
          <Item
            key={d._id}
            item={d}
            completedItems={(d as any).completedItems?.length}
          />
        ))}
      </div>
      <h2 className="text-center text-2xl mb-1">
        Showing {data?.docs.length} of {data?.totalDocs} logs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto pb-10 px-2">
        {data?.docs.map((d) => (
          <Item
            key={d._id}
            item={d}
            completedItems={(d as any).completedItems?.length}
          />
        ))}
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
          backgroundSize: "100%",
        }}
        className="h-28 bg-no-repeat bg-top relative"
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
            <div className="flex flex-row gap-1">
              <FaUser /> {item.creator.accountName}
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
