import { useQuery } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { FaChevronLeft, FaSpinner } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, fetchWithKey, getAvatar } from "../../util";
import { UserResponse } from "../../types";
import GroupsGrid from "../primitives/GroupsGrid";
import SectionHeader from "../primitives/SectionHeader";

export default function UserScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { isLoading, error, data } = useQuery(
    ["user", params.account],
    () =>
      fetchWithKey<UserResponse>(`${API_URL}/api/user/${params.account}`).then(
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

  if (!params.account) {
    return (
      <div className="flex justify-center items-center h-full text-red-700">
        Could not find that user
      </div>
    );
  }
  return (
    <div className="px-3">
      <div className="relative flex flex-row gap-1 text-center justify-center items-center w-full p-5 mb-3">
        <FaChevronLeft
          className="absolute left-0 top-8 text-3xl gwcursor-btn hover:scale-110"
          onClick={() => {
            navigate(-1);
          }}
        />
        <div className="flex flex-col justify-center items-center gap-2">
          <img
            src={getAvatar(params.account)}
            className="rounded-full w-20 h-20"
          />
          <h1 className="text-3xl">{params.account}</h1>
        </div>
      </div>
      {data?.authored && data?.authored.length > 0 ? (
        <>
          <SectionHeader>Authored</SectionHeader>
          <GroupsGrid
            emptyMessage="Challenges made by this user will appear here"
            items={data?.authored}
          />
        </>
      ) : null}
      <SectionHeader>Completion</SectionHeader>
      <GroupsGrid
        emptyMessage="Challenges this user is doing will appear here"
        items={data?.completion}
      />
    </div>
  );
}
