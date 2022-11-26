import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { Body } from "@tauri-apps/api/http";
import cls from "classnames";
import {
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaInfoCircle,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import * as Sentry from "@sentry/react";
import Modal from "react-modal";
import { GroupType, WithRating, GroupDocument, ItemType } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import Input from "../../primitives/Input";
import Button from "../../primitives/Button";
import {
  API_URL,
  EXPANSIONS,
  fetchWithKey,
  getGeoCoords,
  MOUNTS,
} from "../../../util";
import { useLocalImageHook } from "../../hooks/useLocalImage";
import { difficultyMap } from "../../primitives/Difficulty";
import customToast from "../../primitives/CustomToast";
import RingedItems from "../../primitives/RingedItems";

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

export default function GroupFormScreen() {
  const [saving, setSaving] = React.useState(false);

  const [group, setGroup] = React.useState<
    Omit<GroupType, "creator" | "isActive" | "createdAt" | "updatedAt"> & {
      _id?: string;
    }
  >({
    name: "",
    description: "",
    bannerImageUrl: "",
    difficulty: 3,
    items: [],
    masteries: [],
    expansions: [],
    isPromoted: false,
    prizes: [],
    status: "active",
    mounts: [],
  });

  const [showHowTo, setShowHowTo] = React.useState(
    !localStorage.getItem("v1/gw2-sightseeing-app/how-to")
  );

  React.useEffect(() => {
    if (!showHowTo) {
      localStorage.setItem("v1/gw2-sightseeing-app/how-to", "done");
    }
  }, [showHowTo]);

  const { id: initialId } = useParams();
  const [id, setId] = React.useState(() => initialId);

  const { takeScreenshot, saveImage } = useLocalImageHook();

  React.useEffect(() => {
    Modal.setAppElement("#app");
  }, []);

  const { isLoading } = useQuery(
    [`group/${id}`],
    () =>
      fetchWithKey<WithRating<GroupDocument>>(
        `${API_URL}/api/groups/${id}`
      ).then((res) => res.data),
    {
      onSuccess: (data) => {
        setGroup((g) => ((g as any)._id ? g : data));
      },
      onError: (e) => {
        Sentry.captureException(e);
      },
      enabled: !!id,
      refetchOnMount: true,
    }
  );

  async function save(
    e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLButtonElement>
  ) {
    try {
      setSaving(true);
      e.preventDefault();
      const embellishedGroupItems = [];
      for (const item of group.items) {
        if (!item.imageUrl && !item.name?.trim() && !item.description?.trim()) {
          continue;
        }
        let imageUrl = item.imageUrl;
        if (item.imageUrl?.includes("|")) {
          const [_, fileSrc] = (item.imageUrl || "").split("|");
          const result = await saveImage(
            (group as any)._id || "new_group",
            fileSrc
          );
          imageUrl = result;
          customToast("success", "Saved image!", {
            position: "bottom-right",
            size: "sm",
          });
        }
        const { __v, ...remaining } = item;
        embellishedGroupItems.push({
          ...remaining,
          imageUrl,
        });
      }
      const { __v, ...remainingGroup } = group as any;
      const embellishedGroup = {
        ...remainingGroup,
        items: embellishedGroupItems,
      };
      const result = (await fetchWithKey(
        `${API_URL}/api/groups${id ? `/${id}` : ""}`,
        {
          method: id ? "PUT" : "POST",
          body: Body.json(embellishedGroup),
        }
      ).then((r) => r.data)) as any;
      if (!result._id) throw new Error("No ID on save");
      setGroup(result);
      setId(result._id);
      customToast("success", "Saved successfully!");
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      customToast("error", `Error saving, please try again!`);
    } finally {
      setSaving(false);
    }
  }

  if (!!id && isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-3xl">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-2 overflow-x-hidden py-3">
      <PageHeader
        className="pt-10 sm:pt-0"
        rightAction={
          <Button onClick={save} disabled={saving} className="shadow-md mr-3">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
          </Button>
        }
        rightClassName="!fixed top-10 right-3 sm:text-lg"
      >
        {group._id ? "Edit" : "New"} Group
      </PageHeader>
      <form
        onSubmit={save}
        className="flex flex-col gap-2 max-w-2xl mx-auto mt-4 items-center"
      >
        <Input
          outerClassName="w-full sm:w-auto"
          label="Name"
          placeholder="Name..."
          value={group.name}
          onChange={(e) => setGroup((g) => ({ ...g, name: e.target.value }))}
        />
        <Input
          outerClassName="w-full sm:w-auto"
          label="Description"
          placeholder="Description..."
          value={group.description}
          onChange={(e) =>
            setGroup((g) => ({ ...g, description: e.target.value }))
          }
        />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {Object.entries(difficultyMap).map(([k, v]) => (
            <Button
              key={k}
              type="button"
              className={cls(
                `${v.border} border rounded-md px-2 py-1 text-xs text-center`,
                { [v.colour]: k === group.difficulty.toString() }
              )}
              style={{}}
              onClick={() => setGroup((g) => ({ ...g, difficulty: Number(k) }))}
            >
              {v.label}
            </Button>
          ))}
        </div>
        <RingedItems
          type="expansion"
          label="Suggested Expansions"
          mapping={EXPANSIONS}
          onClick={(k) =>
            setGroup((g) => {
              let items = g.expansions || [];
              const exists = items.includes(k);
              if (exists) {
                items = items.filter((i) => i !== k);
              } else {
                items = items.concat(k);
              }
              return {
                ...g,
                expansions: items,
              };
            })
          }
          selected={group.expansions || []}
        />
        <RingedItems
          type="mount"
          label="Suggested Mounts"
          mapping={MOUNTS}
          onClick={(k) =>
            setGroup((g) => {
              let items = g.mounts || [];
              const exists = items.includes(k);
              if (exists) {
                items = items.filter((i) => i !== k);
              } else {
                items = items.concat(k);
              }
              return {
                ...g,
                mounts: items,
              };
            })
          }
          selected={group.mounts || []}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-4 my-5">
          {(group.items || []).map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-center items-center gap-2 relative"
            >
              {item.imageUrl ? (
                <img
                  src={(item.imageUrl.split("|") || [])[0] || ""}
                  className="w-full aspect-video bg-gray-700 bg-opacity-20 rounded-md"
                />
              ) : (
                <div className="w-full aspect-video bg-gray-700 rounded-md flex justify-center items-center text-2xl bg-opacity-50 opacity-50">
                  <FaImage />
                </div>
              )}
              <Input
                outerClassName="w-full"
                className="w-full"
                labelClassName="w-full sm:w-1/2"
                label={`Name`}
                placeholder="Name..."
                value={item.name}
                onChange={(e) =>
                  setGroup((g) => {
                    const newItems = g.items
                      .slice(0, i)
                      .concat({
                        ...g.items[i],
                        name: e.target.value,
                      } as any)
                      .concat(g.items.slice(i + 1));
                    return { ...g, items: newItems };
                  })
                }
              />
              <Input
                outerClassName="w-full"
                className="w-full"
                labelClassName="w-full sm:w-1/2"
                label={`Description`}
                placeholder="Description..."
                value={item.description}
                onChange={(e) =>
                  setGroup((g) => {
                    const newItems = g.items
                      .slice(0, i)
                      .concat({
                        ...g.items[i],
                        description: e.target.value,
                      } as any)
                      .concat(g.items.slice(i + 1));
                    return { ...g, items: newItems };
                  })
                }
              />
              <div className="flex flex-row gap-1 justify-center items-center text-sm">
                <Button
                  className="gwcursor-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    const [{ src, fileSrc }, data] = await Promise.all([
                      takeScreenshot(),
                      invoke("get_mumble").then((raw) =>
                        JSON.parse((raw as string) || "{}")
                      ),
                    ]);
                    console.info("[img]", { src, fileSrc });
                    const geocoords = await getGeoCoords(data);
                    setGroup((g) => {
                      const newItems = g.items
                        .slice(0, i)
                        .concat({
                          ...g.items[i],
                          imageUrl: `${src}|${fileSrc}`,
                          position: data.avatar.position.map((p: number) =>
                            Number(p.toFixed(4))
                          ),
                          metadata: {
                            geocoords,
                            mapId: data.context?.map_id,
                          },
                        } as any)
                        .concat(g.items.slice(i + 1));
                      return { ...g, items: newItems };
                    });
                  }}
                >
                  <FaCamera /> Capture Location
                </Button>
              </div>
              {item.imageUrl?.includes("|") ? (
                <FaExclamationTriangle
                  className="!absolute right-8 top-1 !text-yellow-600 text-xl !p-0"
                  title="Item needs to be saved"
                />
              ) : null}
              <Button
                className="!absolute right-1 top-1 !bg-red-600 text-xs !p-1"
                type="button"
                onClick={() =>
                  setGroup((g) => {
                    return {
                      ...g,
                      items: g.items.slice(0, i).concat(g.items.slice(i + 1)),
                    };
                  })
                }
              >
                <FaTimes />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-2 justify-center items-center">
          <Button
            type="button"
            onClick={() => {
              const newItem: Omit<ItemType, "owner"> = {
                name: "",
                description: "",
                imageUrl: "",
                precision: 5,
                position: [0, 0, 0],
              };
              setGroup((g) => ({
                ...g,
                items: g.items.concat(newItem as any),
              }));
            }}
          >
            <FaPlus /> Add Item
          </Button>
        </div>
      </form>
      <Modal
        isOpen={showHowTo}
        onRequestClose={() => setShowHowTo(false)}
        style={blankCustomStyles}
      >
        <div className="py-5 px-10 rounded-lg drop-shadow-lg bg-brown-dark flex flex-col justify-center items-center gap-5 text-center">
          <h2 className="text-3xl flex flex-row justify-center items-center gap-2">
            <FaInfoCircle /> How to
          </h2>
          <p className="max-w-sm">
            Fill out the details and add items to create your challenge!
          </p>
          <p className="max-w-sm">When adding items, clicking:</p>
          <span className="flex flex-row gap-1 justify-center items-center bg-brown-light px-3 py-2 rounded-md">
            <FaCamera /> Capture Location
          </span>
          <p className="max-w-sm">
            The app will switch to Guild Wars 2 (by alt-tabbing once) and then
            capture a screenshot (using Print Screen)
          </p>
          <p className="max-w-sm">
            To ensure this works as expected, please make sure Guild Wars 2 was
            your last focused window, and your Print Screen key is bound to take
            a screenshot.
          </p>
          <p className="max-w-sm">This guide will only be shown once.</p>
          <Button
            className="px-3 py-2 text-lg"
            onClick={() => setShowHowTo(false)}
          >
            <FaCheckCircle /> Acknowledge
          </Button>
        </div>
      </Modal>
    </div>
  );
}
