import { useQuery } from "@tanstack/react-query";
import format from "date-fns/format";
import { FaClock, FaSpinner, FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { API_URL, fetchWithKey } from "../../../util";
import PageHeader from "../../primitives/PageHeader";

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
      <PageHeader>Leaderboard</PageHeader>
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
            <div className="flex-1 flex flex-row gap-2 items-center">
              <FaUser />
              {d.accountName}
            </div>
            <div className="flex flex-row gap-2 justify-center items-center">
              <FaClock />
              {d.updatedAt
                ? format(new Date(d.updatedAt), "HH:mm dd/MM/yy")
                : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
