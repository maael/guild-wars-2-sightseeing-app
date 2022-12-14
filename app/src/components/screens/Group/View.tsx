import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaClock,
  FaExpandArrowsAlt,
  FaList,
  FaPencilAlt,
  FaRegStar,
  FaSpinner,
  FaStar,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { useParams, Link, useNavigate } from "react-router-dom";
import cls from "classnames";
import { invoke } from "@tauri-apps/api/tauri";
import { Body } from "@tauri-apps/api/http";
import { Howl } from "howler";
import format from "date-fns/format";
import Modal from "react-modal";
import * as Sentry from "@sentry/react";
import { CompletionDocument, HomeGroupWithItems } from "../../../types";
import {
  API_URL,
  fetchWithKey,
  getAvatar,
  MOUNTS,
  EXPANSIONS,
} from "../../../util";
import Button from "../../primitives/Button";
import Difficulty from "../../primitives/Difficulty";
import PageHeader from "../../primitives/PageHeader";
import Rating from "../../primitives/Rating";
import customToast from "../../primitives/CustomToast";
import { WebviewWindow } from "@tauri-apps/api/window";
import RingedItems from "../../primitives/RingedItems";

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

const blankCustomStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.0)",
    padding: 10,
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
    <div className="grid grid-cols-5 gap-1 gwcursor-btn select-none px-2">
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

function useGroupMatch(
  setShowComplete: (show: boolean) => void,
  group?: HomeGroupWithItems
) {
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
          JSON.parse((r as string) || "{}")
        );
        if (Object.keys(data).length === 0) return;
        if (data.error) {
          console.warn("[link:error]", data.error);
          return;
        }
        const position = data.avatar.position;
        const matches = (group?.items || []).filter((i) => {
          return i.position.every((v, idx) =>
            within(position[idx], v, i.precision)
          );
        });
        const newMatches = matches?.filter((m) => !groupMatches.has(m._id));
        if (newMatches && newMatches.length > 0) {
          bellSound.play();
          for (const match of newMatches) {
            customToast("success", `Found ${match.name || "a location"}!`);
          }
          if (
            groupMatches.size + (newMatches?.length || 0) ===
            group?.itemCount
          ) {
            setShowComplete(true);
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
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const { id } = useParams();
  const nav = useNavigate();
  const { isLoading, error, data, refetch } = useQuery(
    [`group/${id}`],
    () =>
      fetchWithKey<HomeGroupWithItems>(`${API_URL}/api/groups/${id}`).then(
        (d) => d.data
      ),
    {
      onError: (e) => {
        Sentry.captureException(e);
      },
    }
  );

  const groupMatches = useGroupMatch(setShowComplete, data);

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
    <div className="flex-1 flex flex-col">
      <PageHeader
        className="pt-10 sm:pt-0"
        rightAction={
          data?.creator?.accountName === localStorage.getItem("gw2-account") ||
          localStorage.getItem("gw2-account") === "Mael.3259" ? (
            <div className="flex flex-row gap-3 justify-center items-center">
              <Link to={`/groups/${id}/edit`}>
                <Button>
                  <FaPencilAlt /> Edit
                </Button>
              </Link>
              <Button
                className="!bg-red-700"
                style={{}}
                onClick={() => {
                  setDeleting(true);
                }}
              >
                <FaTrash /> Delete
              </Button>
            </div>
          ) : null
        }
      >
        {data?.name}
      </PageHeader>
      <div className="flex flex-col justify-center items-center gap-2 mt-2">
        <div className="mx-3 text-center">{data?.description}</div>
        <div className="flex flex-col gap-2 xs:flex-row xs:gap-5 w-full justify-center items-center">
          <div className="flex flex-row justify-center items-center gap-1">
            <FaClock /> {format(new Date(data?.createdAt || 0), "dd/MM/yy")}
          </div>
          <Link to={`/user/${data?.creator?.accountName}`}>
            <div className="flex flex-row justify-center items-center gap-1">
              <img
                src={getAvatar(data?.creator?.accountName)}
                className="rounded-full w-5 h-5"
              />
              {data?.creator?.accountName}
            </div>
          </Link>
        </div>
        {data?.expansions && data?.expansions.length > 0 ? (
          <RingedItems
            type="expansion"
            items={data?.expansions}
            label="Suggested Expansions"
            mapping={EXPANSIONS}
          />
        ) : null}
        {data?.mounts && data?.mounts.length > 0 ? (
          <RingedItems
            type="mount"
            items={data?.mounts}
            label="Suggested Mounts"
            mapping={MOUNTS}
          />
        ) : (
          []
        )}
        <div className="flex flex-col gap-2 xs:flex-row xs:gap-5 w-full justify-center items-center">
          <Difficulty level={data?.difficulty} />
          <Rating rating={data?.ratings} />
        </div>
        <RatingSelection
          id={id}
          refetch={refetch}
          userRating={data?.userRating?.rating}
        />
        <Link to={`/groups/${id}/leaderboard`}>
          <Button type="button" className="gap-2">
            <FaList /> Leaderboard
          </Button>
        </Link>
        <Prizes prizeNote={data?.prizeNote} prizes={data?.prizes} />
      </div>
      <div className="flex-1 w-full pt-3 pb-8">
        <ItemGrid
          items={data?.items}
          groupMatches={groupMatches}
          setSelected={setSelected}
        />
      </div>
      <Modal
        isOpen={deleting}
        onRequestClose={() => setDeleting(false)}
        style={blankCustomStyles}
        contentLabel={`Delete ${
          (data?.items || [])[selected!]?.name || "item"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="text-xl text-center xs:text-2xl bg-black bg-opacity-40 px-5 py-3 rounded-lg">
            Are you sure you want to delete this ?
          </div>
          <div className="flex flex-row gap-5 justify-center items-center">
            <Button
              className="!bg-red-700"
              style={{}}
              onClick={async () => {
                try {
                  await fetchWithKey(`${API_URL}/api/groups/${id}`, {
                    method: "DELETE",
                  });
                  customToast("success", "Deleted");
                  nav("/groups");
                } catch (e) {
                  console.error(e);
                  customToast("error", `Error deleting, please try again`);
                }
              }}
            >
              <FaTrash /> Delete
            </Button>
            <Button
              onClick={async () => {
                setDeleting(false);
              }}
            >
              <FaTimes /> Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={selected !== null}
        onRequestClose={() => setSelected(null)}
        style={customStyles}
        contentLabel={(data?.items || [])[selected!]?.name}
      >
        <img src={(data?.items || [])[selected!]?.imageUrl || ""} />
        <div className="my-2 text-center">
          {(data?.items || [])[selected!]?.name}
        </div>
        <div
          className="absolute top-3 left-3 text-base bg-brown-dark flex flex-row gap-2 justify-center items-center rounded-2xl pl-2 pr-3 py-1 gwcursor-btn transition-transform hover:scale-110"
          onClick={() => {
            const expandedView = new WebviewWindow(
              `${data?.items[selected!]?._id}`,
              {
                title: `${data?.name} - ${
                  data?.items[selected!]?.name || "Sightseeing Item"
                }`,
                width: 2560 * 0.5,
                height: 1440 * 0.5,
                transparent: true,
                theme: "dark",
                url: data?.items[selected!]?.imageUrl,
              }
            );
            expandedView.once("tauri://created", function () {
              console.info("[opened]");
            });
            expandedView.once("tauri://error", function (e) {
              console.error("[error]", e);
            });
          }}
        >
          <FaExpandArrowsAlt />
          <span>Expand</span>
        </div>
        {groupMatches.has((data?.items || [])[selected!]?._id || "") ? (
          <div className="absolute top-3 right-12 text-base bg-green-600 flex flex-row gap-2 justify-center items-center rounded-2xl pl-2 pr-3 py-1">
            <FaCheckCircle />
            <span>Found</span>
          </div>
        ) : null}
        <div className="absolute top-3 right-3 text-2xl text-gray-200 gwcursor-btn drop-shadow-md transition-transform hover:scale-110">
          <FaTimesCircle onClick={() => setSelected(null)} />
        </div>
      </Modal>
      <Modal
        isOpen={showComplete}
        onRequestClose={() => setShowComplete(false)}
        style={blankCustomStyles}
      >
        <div className="flex flex-col gap-2">
          <img
            src="/ui/party-quaggan.png"
            className="mx-auto"
            style={{ height: "60vmin", width: "60vmin" }}
          />
          <p className="text-center text-lg xs:text-2xl bg-black bg-opacity-20 px-2 py-5 rounded-lg">
            Congratulations! You finished the challenge!
            <span className="text-sm text-center rounded-lg block">
              Click anywhere to close
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Item({
  item: d,
  matched,
  onClick,
}: {
  item: HomeGroupWithItems["items"][0];
  index: number;
  matched: boolean;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        backgroundImage: "url(/ui/windowbg-glyphs.png)",
      }}
      className="bg-no-repeat bg-top bg-cover relative gwcursor-btn h-full"
      onClick={onClick}
    >
      <div
        className={cls("p-2 pb-4 flex flex-col gap-1 h-full", {
          "opacity-40": matched,
        })}
      >
        <div className="rounded-md overflow-hidden mb-1">
          <LoadableImage src={d.imageUrl} />
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

function ItemGrid({
  items,
  groupMatches,
  setSelected,
}: {
  items?: any[];
  groupMatches: Set<string>;
  setSelected: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 px-2">
      {(items || []).map((d, idx) => (
        <Item
          key={d._id}
          index={idx}
          item={d}
          matched={groupMatches.has(d._id)}
          onClick={() => setSelected(idx)}
        />
      ))}
    </div>
  );
}

function LoadableImage({ src }: { src?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [viewable, setViewable] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === ref.current && entry.isIntersecting) {
            setViewable(true);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (ref.current) {
      intersectionObserver.observe(ref.current);
    }
    return () => intersectionObserver.disconnect();
  }, []);
  return src ? (
    <div ref={ref}>
      {loaded ? null : (
        <div className="w-full flex justify-center items-center aspect-video">
          <FaSpinner className="animate-spin text-xl" />
        </div>
      )}
      {viewable ? (
        <img
          src={src}
          loading={"eager"}
          onLoad={() => setLoaded(true)}
          style={{ display: loaded ? "initial" : "none" }}
        />
      ) : null}
    </div>
  ) : null;
}

function Prizes({
  prizeNote,
  prizes,
}: {
  prizeNote?: string;
  prizes: HomeGroupWithItems["prizes"];
}) {
  return prizes && prizes.length > 0 ? (
    <div className="flex flex-col gap-1 justify-center items-center">
      <h3 className="text-2xl -mb-1">Prizes</h3>
      {prizeNote ? (
        <p className="max-w-sm text-center text-base">{prizeNote}</p>
      ) : null}
      {prizes?.map((p) => (
        <div
          key={`${p.positionLabel}-${p.label}`}
          className="flex flex-row gap-1 justify-center items-center text-lg"
        >
          <div className="bg-brown-light rounded-md px-3 py-1">
            {p.positionLabel}
          </div>
          <img src={p.imageUrl} className="h-8 w-8 rounded-full" />
          <div>
            {p.label} {p.amount === 1 ? "" : `x${p.amount}`}
          </div>
        </div>
      ))}
    </div>
  ) : null;
}
