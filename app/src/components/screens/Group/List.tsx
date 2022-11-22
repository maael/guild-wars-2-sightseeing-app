import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FaClock,
  FaEye,
  FaSpinner,
  FaStar,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import cls from "classnames";
import * as Sentry from "@sentry/react";
import { YoursResponse, OthersResponse, HomeGroup } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import { API_URL, fetchWithKey, getAvatar } from "../../../util";
import Button from "../../primitives/Button";
import GroupsGrid from "../../primitives/GroupsGrid";
import SectionHeader from "../../primitives/SectionHeader";

export default function GroupListScreen() {
  const [pageSection, setPageSection] = useState("yours");

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
      <Toggle
        items={[
          {
            content: (
              <>
                <FaUser /> Yours
              </>
            ),
            value: "yours",
          },
          {
            content: (
              <>
                <FaUsers /> Others
              </>
            ),
            value: "others",
          },
        ]}
        active={pageSection}
        onChange={setPageSection}
      />
      {pageSection === "yours" ? (
        <YourLogs setPageSection={setPageSection} />
      ) : (
        <OthersLogs />
      )}
    </div>
  );
}

function YourLogs({
  setPageSection,
}: {
  setPageSection: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { isLoading, error, data } = useQuery(
    ["groups/yours"],
    () =>
      fetchWithKey<YoursResponse>(`${API_URL}/api/yours`).then(
        (res) => res.data
      ),
    {
      onError: (e) => {
        console.info("[groups:error]", e);
        Sentry.captureException(e);
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-3xl py-20">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-700 text-lg mx-2">
        {`An error has occurred: ${(error as Error) || "Unknown error"} ${
          (error as Error)?.stack || ""
        }`}
      </div>
    );
  }

  return (
    <>
      <SectionHeader>
        {`Active logs (${data?.completion?.length})`}
      </SectionHeader>
      <GroupsGrid
        emptyMessage={
          <span className="flex flex-col justify-center items-center gap-4">
            Any logs you've started or completed will appear here
            <Button
              onClick={() => setPageSection("others")}
              className="text-2xl"
            >
              Find some here!
            </Button>
          </span>
        }
        items={data?.completion}
      />
      {data?.authored && data?.authored?.length > 0 ? (
        <>
          <SectionHeader>
            {`Created logs (${data?.authored?.length})`}
          </SectionHeader>
          <GroupsGrid
            emptyMessage="Any logs you've created will appear here!"
            items={data?.authored}
          />
        </>
      ) : null}
    </>
  );
}

function OthersLogs() {
  const [groupType, setGroupType] = useState("recent");
  const { isLoading, error, data } = useQuery(
    ["groups/others"],
    () =>
      fetchWithKey<OthersResponse>(`${API_URL}/api/others`).then(
        (res) => res.data
      ),
    {
      onError: (e) => {
        console.info("[groups:error]", e);
        Sentry.captureException(e);
      },
    }
  );
  const showingItems = groupType === "top" ? data?.top : data?.recent;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-3xl py-20">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-700 text-lg mx-2">
        {`An error has occurred: ${(error as Error) || "Unknown error"} ${
          (error as Error)?.stack || ""
        }`}
      </div>
    );
  }
  return (
    <>
      <Promoted items={data?.promoted} />
      <LogToggle groupType={groupType} setGroupType={setGroupType} />
      <GroupsGrid
        emptyMessage="Logs that you can complete will be here!"
        items={showingItems}
      />
    </>
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
                  "bg-gray-400 bg-opacity-80 hover:bg-opacity-100":
                    active !== idx,
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
      <Toggle
        items={[
          {
            content: (
              <>
                <FaClock /> Recent
              </>
            ),
            value: "recent",
          },
          {
            content: (
              <>
                <FaStar /> Top
              </>
            ),
            value: "top",
          },
        ]}
        active={groupType}
        onChange={setGroupType}
      />
    </>
  );
}

function Toggle({
  items,
  onChange,
  active,
}: {
  items: { content: React.ReactNode; value: string }[];
  onChange: (val: string) => void;
  active: string;
}) {
  return (
    <div className="flex flex-row justify-center uppercase max-w-xs w-5/6 mx-auto mb-2">
      {items.map((item, idx) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cls(
            "px-3 py-1 transition-transform hover:scale-110 cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2 text-base sm:text-lg",
            {
              "bg-brown-light": active === item.value,
              "bg-brown-dark": active !== item.value,
              "rounded-l-lg": idx === 0,
              "rounded-r-lg": idx === items.length - 1,
            }
          )}
        >
          {item.content}
        </button>
      ))}
    </div>
  );
}
