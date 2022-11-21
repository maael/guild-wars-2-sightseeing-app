import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaClock, FaEye, FaSpinner, FaStar } from "react-icons/fa";
import cls from "classnames";
import * as Sentry from "@sentry/react";
import { HomeResponse, HomeGroup } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import { API_URL, fetchWithKey, getAvatar } from "../../../util";
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
        className="pt-12 sm:pt-3 mb-2"
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
      <Promoted items={data?.promoted} />
      <LogToggle groupType={groupType} setGroupType={setGroupType} />
      <GroupsGrid
        emptyMessage="Logs that you can complete will be here!"
        items={showingItems}
      />
    </div>
  );
}

function Promoted({
  items,
}: {
  items?: (HomeGroup & { bannerImageUrl?: string })[];
}) {
  const [active, setActive] = React.useState(0);
  const activeItem = (items || [])[active];
  return items && items.length > 0 ? (
    <div className="overflow-hidden w-full sm:w-4/5 aspect-video relative my-5 mx-auto px-1 sm:px-5">
      {activeItem ? (
        <div
          className="w-full h-full bg-cover bg-no-repeat bg-center relative rounded-lg drop-shadow-xl"
          style={{ backgroundImage: `url(${activeItem.bannerImageUrl})` }}
        >
          <div className="absolute bottom-12 left-0 right-0 bg-brown-dark px-5 py-2 drop-shadow-lg">
            <h2 className="text-2xl">{activeItem.name}</h2>
            <p className="text-lg">{activeItem.description}</p>
          </div>
          <Link to={`/user/${activeItem.creator.accountName}`}>
            <div className="flex flex-row gap-1 justify-center items-center absolute top-3 right-3 bg-brown-dark px-2 py-1 rounded-md drop-shadow-lg">
              <img
                src={getAvatar(activeItem.creator.accountName)}
                className="h-5 w-5 rounded-full"
              />
              {activeItem.creator.accountName}
            </div>
          </Link>
          <div className="text-xl !absolute bottom-28 flex justify-center items-center left-0 right-0">
            <Link to={`/groups/${activeItem._id}`}>
              <Button>
                <FaEye /> View
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
      {items && items.length > 1 ? (
        <div className="absolute bottom-5 flex flex-row gap-3 justify-center items-center left-5 right-5">
          {items?.map((i, idx) => (
            <div
              key={`marker-${i._id}`}
              onClick={() => setActive(idx)}
              className={cls(
                "rounded-full h-3 w-3 outline outline-offset-2 outline-2 outline-white cursor-pointer drop-shadow-lg",
                {
                  "bg-white": active === idx,
                  "bg-gray-400 bg-opacity-80": active !== idx,
                }
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  ) : null;
}

function LogToggle({
  groupType,
  setGroupType,
}: {
  groupType: string;
  setGroupType: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <>
      <h2 className="text-center text-2xl mb-1 capitalize">{groupType} logs</h2>
      <div className="flex flex-row justify-center uppercase max-w-sm w-5/6 mx-auto mb-1">
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
    </>
  );
}
