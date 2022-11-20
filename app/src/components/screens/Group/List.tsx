import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaClock, FaSpinner, FaStar } from "react-icons/fa";
import cls from "classnames";
import * as Sentry from "@sentry/react";
import { HomeGroup, HomeResponse } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import { API_URL, fetchWithKey, getAvatar } from "../../../util";
import Difficulty from "../../primitives/Difficulty";
import Rating from "../../primitives/Rating";
import Button from "../../primitives/Button";
import GroupsGrid from "../../primitives/GroupsGrid";
import SectionHeader from "../../primitives/SectionHeader";

export default function GroupListScreen() {
  const [groupType, setGroupType] = useState("recent");
  const { isLoading, error, data } = useQuery(
    ["groups"],
    () =>
      fetchWithKey<HomeResponse>(`${API_URL}/api/home`).then((res) => res.data),
    {
      onError: (e) => {
        console.info("[groups:error]", e);
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

  const showingItems = groupType === "top" ? data?.top : data?.recent;

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
      <SectionHeader>
        {`Your active logs (${data?.completion?.length})`}
      </SectionHeader>
      <GroupsGrid
        emptyMessage="Any logs you've started or completed will appear here, find some below!"
        items={data?.completion}
      />
      <SectionHeader>
        {`Your created logs (${data?.authored?.length})`}
      </SectionHeader>
      <GroupsGrid
        emptyMessage="Any logs you've created will appear here, find some below!"
        items={data?.authored}
      />
      <h2 className="text-center text-2xl mb-1 capitalize">{groupType} logs</h2>
      <div className="flex flex-row justify-center uppercase max-w-sm w-5/6 mx-auto">
        <button
          onClick={() => setGroupType("recent")}
          className={cls(
            "px-5 py-1.5 transition-transform hover:scale-110 rounded-l-lg cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2 text-sm sm:text-base",
            {
              "bg-brown-light": groupType === "recent",
              "bg-brown-dark": groupType === "top",
            }
          )}
        >
          <FaClock /> Recent
        </button>
        <button
          onClick={() => setGroupType("top")}
          className={cls(
            "px-5 py-1.5 transition-transform hover:scale-110 rounded-r-lg cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2 text-sm sm:text-base",
            {
              "bg-brown-light": groupType === "top",
              "bg-brown-dark": groupType === "recent",
            }
          )}
        >
          <FaStar /> Top
        </button>
      </div>
      <GroupsGrid
        emptyMessage="Logs that you can complete will be here!"
        items={showingItems}
      />
    </div>
  );
}

function Item({ item }: { item: HomeGroup }) {
  const isDone = item.completion.count === item.itemCount;
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
            <Rating rating={item.ratings} />
          </div>
          <div className="flex-1">{item.description}</div>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div>
              {item.completion.count} of {item.itemCount} items
            </div>
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
