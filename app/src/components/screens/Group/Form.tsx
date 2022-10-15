import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/tauri";
import { Body } from "@tauri-apps/api/http";
import toast from "react-hot-toast";
import cls from "classnames";
import {
  FaCamera,
  FaImage,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import * as Sentry from "@sentry/react";
import { GroupType, WithRating, GroupDocument, ItemType } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import Input from "../../primitives/Input";
import Button from "../../primitives/Button";
import { API_URL, fetchWithKey, getGeoCoords } from "../../../util";
import { useLocalImageHook } from "../../hooks/useLocalImage";
import { difficultyMap } from "../../primitives/Difficulty";

export default function GroupFormScreen() {
  const nav = useNavigate();
  const [saving, setSaving] = React.useState(false);

  const [group, setGroup] = React.useState<
    Omit<GroupType, "creator" | "isActive" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    bannerImageUrl: "",
    difficulty: 3,
    items: [],
    masteries: [],
    expansions: [],
  });

  const { id } = useParams();

  const { takeScreenshot, saveImage } = useLocalImageHook();

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
    }
  );

  async function save(
    e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLButtonElement>
  ) {
    try {
      setSaving(true);
      e.preventDefault();
      const embellishedGroupItems = await Promise.all(
        group.items.map(async (i) => {
          let imageUrl = i.imageUrl;
          if (i.imageUrl?.includes("|")) {
            const [_, fileSrc] = (i.imageUrl || "").split("|");
            const result = await saveImage(
              (group as any)._id || "new_group",
              fileSrc
            );
            imageUrl = result;
          }
          return {
            ...i,
            imageUrl,
          };
        })
      );
      const embellishedGroup = { ...group, items: embellishedGroupItems };
      await fetchWithKey(`${API_URL}/api/groups${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: Body.json(embellishedGroup),
      }).then((r) => r.data);
      nav("/groups");
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      toast.error(`Error saving, please try again!`);
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
        className="pt-12 sm:pt-0"
        rightAction={
          <Button onClick={save} disabled={saving} className="shadow-md mr-3">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
          </Button>
        }
        rightClassName="!fixed top-10 right-3 sm:text-lg"
      >
        New Group
      </PageHeader>
      <form
        onSubmit={save}
        className="flex flex-col gap-2 max-w-2xl mx-auto mt-4 items-center"
      >
        <Input
          label="Name"
          placeholder="Name..."
          value={group.name}
          onChange={(e) => setGroup((g) => ({ ...g, name: e.target.value }))}
        />
        <Input
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
              <div className="flex flex-row gap-1 justify-center items-center text-xs">
                <Input
                  label="Position"
                  className="flex-3"
                  value={item.position?.join(", ")}
                  disabled
                />
                <Button
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
                  <FaCamera />
                </Button>
              </div>
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
    </div>
  );
}
