import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaClock,
  FaList,
  FaPencilAlt,
  FaRegStar,
  FaSpinner,
  FaStar,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import cls from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { Body } from "@tauri-apps/api/http";
import { Howl } from "howler";
import format from "date-fns/format";
import Modal from "react-modal";
import * as Sentry from "@sentry/react";
import {
  WithRating,
  GroupDocument,
  ItemDocument,
  CompletionDocument,
} from "../../../types";
import { API_URL, fetchWithKey } from "../../../util";
import Button from "../../primitives/Button";
import Difficulty from "../../primitives/Difficulty";
import PageHeader from "../../primitives/PageHeader";
import Rating from "../../primitives/Rating";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 0,
    border: 0,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 999,
  },
};

const bellSound = new Howl({
  src: ["/sounds/bell.ogg"],
});

function RatingSelection({
  id,
  refetch,
  userRating,
}: {
  id: string;
  refetch: () => Promise<any>;
  userRating?: number;
}) {
  return (
    <div className="grid grid-cols-5 gap-1 cursor-pointer select-none px-2">
      <RatedStar
        userRating={userRating}
        threshold={1}
        onClick={doRating(id, 1, refetch)}
      />
      <RatedStar
        userRating={userRating}
        threshold={2}
        onClick={doRating(id, 2, refetch)}
      />
      <RatedStar
        userRating={userRating}
        threshold={3}
        onClick={doRating(id, 3, refetch)}
      />
      <RatedStar
        userRating={userRating}
        threshold={4}
        onClick={doRating(id, 4, refetch)}
      />
      <RatedStar
        userRating={userRating}
        threshold={5}
        onClick={doRating(id, 5, refetch)}
      />
    </div>
  );
}

function RatedStar({
  userRating,
  threshold,
  onClick,
}: {
  userRating?: number;
  threshold: number;
  onClick: () => void;
}) {
  return !userRating || userRating < threshold ? (
    <FaRegStar onClick={onClick} />
  ) : (
    <FaStar onClick={onClick} />
  );
}

function doRating(id: string, rating: number, refetch: () => Promise<any>) {
  return async function () {
    try {
      await fetchWithKey(`${API_URL}/api/ratings/${id}`, {
        method: "PUT",
        body: Body.json({ rating }),
      }).then((r) => r.data);
      await refetch();
    } catch (e) {
      Sentry.captureException(e);
    }
  };
}

function within(value: number, compare: number, precision: number) {
  return compare - precision < value && value < compare + precision;
}

function useGroupMatch(group?: WithRating<GroupDocument>) {
  const [groupMatches, setGroupMatches] = useState<Set<string>>(new Set());
  const { data: queryData } = useQuery(
    [`completion/${group?._id}`],
    () =>
      fetchWithKey<CompletionDocument>(
        `${API_URL}/api/completions/${group?._id}`
      ).then((res) => res.data),
    {
      onSuccess: (completions) => {
        setGroupMatches(new Set(completions?.items as any));
      },
      onError: (e) => {
        Sentry.captureException(e);
      },
      enabled: !!group?._id,
    }
  );
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await invoke("get_mumble").then((r) =>
          JSON.parse(r as string)
        );
        if (Object.keys(data).length === 0) return;
        const position = data.avatar.position;
        const matches = group?.items.filter((i) => {
          return i.position.every((v, idx) =>
            within(position[idx], v, i.precision)
          );
        });
        const newMatches = matches?.filter((m) => !groupMatches.has(m._id));
        if (newMatches && newMatches.length > 0) {
          bellSound.play();
          for (const match of newMatches) {
            toast.success(`Found ${match.name}!`);
          }
          setGroupMatches(
            (m) => new Set([...m, ...(newMatches?.map((v) => v._id) || [])])
          );
        }
      } catch (e) {
        console.error("[group:match][error]", e);
      }
    }, 2_000);
    return () => {
      clearInterval(interval);
    };
  }, [group, groupMatches]);
  useEffect(() => {
    (async () => {
      const existingMatches = (queryData?.items || []).map((m) => m.toString());
      if (
        groupMatches.size !== 0 &&
        group?._id &&
        ![...groupMatches].every((m) => existingMatches?.includes(m))
      ) {
        await fetchWithKey(`${API_URL}/api/completions/${group?._id}`, {
          method: "PUT",
          body: Body.json([...groupMatches]),
        }).then((r) => r.data);
      }
    })();
  }, [group, groupMatches]);
  return groupMatches;
}

export default function GroupViewScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const { id } = useParams();
  const nav = useNavigate();
  const { isLoading, error, data, refetch } = useQuery(
    [`group/${id}`],
    () =>
      fetchWithKey<WithRating<GroupDocument>>(
        `${API_URL}/api/groups/${id}`
      ).then((d) => d.data),
    {
      onError: (e) => {
        Sentry.captureException(e);
      },
    }
  );

  const groupMatches = useGroupMatch(data);

  useEffect(() => {
    Modal.setAppElement("#app");
  }, []);

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

  if (!id) {
    return (
      <div className="flex justify-center items-center h-full text-red-700">
        Could not find that group
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        className="pt-10 sm:pt-0"
        rightAction={
          data?.creator.accountName === localStorage.getItem("gw2-account") ? (
            <div className="flex flex-row gap-1 justify-center items-center">
              <Link to={`/groups/${id}/edit`}>
                <Button>
                  <FaPencilAlt /> Edit
                </Button>
              </Link>
              <Button
                className="!bg-red-700"
                style={{}}
                onClick={async () => {
                  try {
                    await fetchWithKey(`${API_URL}/api/groups/${id}`, {
                      method: "DELETE",
                    });
                    nav("/groups");
                  } catch (e) {
                    console.error(e);
                    toast.error(`Error deleting, please try again`);
                  }
                }}
              >
                <FaTimes /> Delete
              </Button>
            </div>
          ) : null
        }
      >
        {data?.name}
      </PageHeader>
      <div className="flex flex-col justify-center items-center gap-2 mt-2">
        <div className="mx-3 text-center">{data?.description}</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
          <div className="flex flex-row justify-center items-center gap-1">
            <FaClock /> {format(new Date(data?.createdAt || ""), "dd/MM/yy")}
          </div>
          <div className="flex flex-row justify-center items-center gap-1">
            <FaUser /> {data?.creator.accountName}
          </div>
        </div>
        <Difficulty level={data?.difficulty} />
        <Rating rating={data?.rating} />
        <RatingSelection
          id={id}
          refetch={refetch}
          userRating={data?.rating?.user}
        />
        <Link to={`/groups/${id}/leaderboard`}>
          <Button type="button" className="gap-2">
            <FaList /> Leaderboard
          </Button>
        </Link>

        <div>{data?.expansions.join(",")}</div>
        <div>{data?.masteries.join(",")}</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
          {(data?.items || []).map((d, idx) => (
            <Item
              key={d._id}
              item={d}
              matched={groupMatches.has(d._id)}
              onClick={() => setSelected(idx)}
            />
          ))}
        </div>
      </div>
      <Modal
        isOpen={selected !== null}
        onRequestClose={() => setSelected(null)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <img src={data?.items[selected!]?.imageUrl || ""} />
        <div className="my-2 text-center">{data?.items[selected!]?.name}</div>
      </Modal>
    </div>
  );
}

function Item({
  item: d,
  matched,
  onClick,
}: {
  item: ItemDocument;
  matched: boolean;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        backgroundImage: "url(/ui/windowbg-glyphs.png)",
      }}
      className="bg-no-repeat bg-top bg-cover relative cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cls("p-2 pb-4 flex flex-col gap-1 h-full", {
          "opacity-40": matched,
        })}
      >
        <div className="rounded-md overflow-hidden mb-1">
          {d.imageUrl ? <img src={d.imageUrl} /> : null}
        </div>
        <div>{d.name}</div>
        <div className="text-sm">{d.description}</div>
      </div>

      {matched ? (
        <div className="absolute inset-0 flex justify-center items-center text-4xl">
          <FaCheckCircle className="text-green-600" />
        </div>
      ) : null}
    </div>
  );
}
