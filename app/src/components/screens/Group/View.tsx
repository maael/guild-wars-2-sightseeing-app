import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaClock,
  FaPencilAlt,
  FaRegStar,
  FaSpinner,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import cls from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { Howl } from "howler";
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
    await fetchWithKey(`${API_URL}/api/ratings/${id}`, {
      method: "PUT",
      body: JSON.stringify({ rating }),
    }).then((r) => r.json());
    await refetch();
  };
}

function within(value: number, compare: number, precision: number) {
  return compare - precision < value && value < compare + precision;
}

function useGroupMatch(group?: WithRating<GroupDocument>) {
  const [groupMatches, setGroupMatches] = useState<Set<string>>(new Set());
  useQuery<CompletionDocument>(
    [`completion/${group?._id}`],
    () =>
      fetchWithKey(`${API_URL}/api/completions/${group?._id}`).then((res) =>
        res.json()
      ),
    {
      onSuccess: (completions) => {
        setGroupMatches(new Set(completions?.items as any));
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
      if (groupMatches.size !== 0) {
        console.info("push", group?._id, groupMatches);
        await fetchWithKey(`${API_URL}/api/completions/${group?._id}`, {
          method: "PUT",
          body: JSON.stringify([...groupMatches]),
        }).then((r) => r.json());
      }
    })();
  }, [group, groupMatches]);
  return groupMatches;
}

export default function GroupViewScreen() {
  const { id } = useParams();
  const { isLoading, error, data, refetch } = useQuery<
    WithRating<GroupDocument>
  >([`group/${id}`], () =>
    fetchWithKey(`${API_URL}/api/groups/${id}`).then((res) => res.json())
  );

  const groupMatches = useGroupMatch(data);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-3xl">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-700">
        An error has occurred: {(error as Error).message}
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
        rightAction={
          <Link to={`/groups/${id}/edit`}>
            <Button>
              <FaPencilAlt /> Edit
            </Button>
          </Link>
        }
      >
        {data?.name}
      </PageHeader>
      <div className="flex flex-col justify-center items-center gap-2 mt-2">
        <div>{data?.description}</div>
        <div className="flex flex-row justify-center items-center gap-1">
          <FaClock /> {data?.createdAt}
        </div>
        <div className="flex flex-row justify-center items-center gap-1">
          <FaUser /> {data?.creator.accountName}
        </div>
        <Difficulty level={data?.difficulty} />
        <Rating rating={data?.rating} />

        <RatingSelection
          id={id}
          refetch={refetch}
          userRating={data?.rating?.user}
        />

        <div>{data?.expansions.join(",")}</div>
        <div>{data?.masteries.join(",")}</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
          {(data?.items || []).map((d) => (
            <Item key={d._id} item={d} matched={groupMatches.has(d._id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Item({ item: d, matched }: { item: ItemDocument; matched: boolean }) {
  return (
    <div
      style={{
        backgroundImage: "url(/ui/windowbg-glyphs.png)",
      }}
      className="bg-no-repeat bg-top bg-cover relative"
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
