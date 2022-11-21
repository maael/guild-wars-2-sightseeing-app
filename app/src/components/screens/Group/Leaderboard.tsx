import { useQuery } from "@tanstack/react-query";
import format from "date-fns/format";
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import { FaCheckCircle, FaClock, FaDownload, FaSpinner } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { API_URL, fetchWithKey, getAvatar } from "../../../util";
import PageHeader from "../../primitives/PageHeader";
import Button from "../../primitives/Button";
import customToast from "../../primitives/CustomToast";

export default function GroupLeaderboardScreen() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(
    [`groups/${id}/leaderboard`],
    () =>
      fetchWithKey<any[]>(`${API_URL}/api/leaderboards/${id}`).then(
        (res) => res.data
      ),
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

  return (
    <>
      <PageHeader
        rightAction={
          <Button
            className="right-5 h-8 text-sm"
            onClick={async () => {
              const toSave =
                "account,completed_items,is_completed,updated_at\n" +
                data
                  ?.map(
                    (d) =>
                      `${d.accountName},${d.completedItems},${
                        d.completedItems === d.totalItems ? "Y" : "N"
                      },${d.updatedAt}`
                  )
                  .join("\n");
              await writeTextFile(`gw2-sightseeing-${id}.csv`, toSave, {
                dir: BaseDirectory.Document,
              });
              customToast("success", "Saved to your documents folder!");
            }}
          >
            <FaDownload /> <span className="hidden xs:inline">Download</span>
          </Button>
        }
      >
        Leaderboard
      </PageHeader>
      <h2 className="text-center text-xl">
        {data?.length} completion{data?.length == 1 ? "" : "s"}
      </h2>
      <div className="max-w-xl mx-auto flex flex-col mt-2 px-4">
        {data?.map((d, idx) => (
          <div
            key={d._id}
            className="px-3 py-2 flex flex-row gap-2 justify-center items-center"
            style={{
              backgroundColor:
                idx % 2 === 1
                  ? "rgba(96, 76, 52, 0.8)"
                  : "rgba(55, 45, 35, 0.8)",
            }}
          >
            <Link
              to={`/user/${d.accountName}`}
              className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap"
            >
              <div className="w-full flex flex-row gap-2 items-center">
                <img
                  src={getAvatar(d.accountName)}
                  className="rounded-full w-5 h-5"
                />
                {d.accountName}
              </div>
            </Link>
            <div
              className="px-2 sm:px-6 text-center flex flex-row justify-center items-center gap-1"
              title={`${d.completedItems} completed of ${d.totalItems}`}
            >
              {d.completedItems >= d.totalItems ? (
                <FaCheckCircle className="text-green-500 text-opacity-80" />
              ) : null}
              {((d.completedItems / (d.totalItems || 1)) * 100).toFixed(0)}%
            </div>
            <div className="flex flex-row gap-1 sm:gap-3 justify-end items-center">
              <FaClock className="text-white text-opacity-80" />
              <time
                title={`Updated at ${
                  d.updatedAt
                    ? format(new Date(d.updatedAt), "HH:mm dd/MM/yy")
                    : ""
                }`}
              >
                <span className="hidden sm:inline-block mr-2">
                  {d.updatedAt ? format(new Date(d.updatedAt), "HH:mm") : null}
                </span>
                {d.updatedAt ? format(new Date(d.updatedAt), "dd/MM") : null}
                <span className="hidden sm:inline-block">
                  {d.updatedAt ? format(new Date(d.updatedAt), "/yy") : null}
                </span>
              </time>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
