import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Group, WithRating, GroupDocument, Item } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import Input from "../../primitives/Input";
import Button from "../../primitives/Button";
import { API_URL } from "../../../util";
import { FaCamera } from "react-icons/fa";
import { useLocalImageHook } from "../../hooks/useLocalImage";

export default function GroupFormScreen() {
  const nav = useNavigate();

  const [group, setGroup] = React.useState<
    Omit<Group, "creator" | "isActive" | "createdAt" | "updatedAt">
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

  useQuery<WithRating<GroupDocument>>(
    [`group/${id}`],
    () => fetch(`${API_URL}/api/groups/${id}`).then((res) => res.json()),
    {
      onSuccess: (data) => {
        setGroup((g) => ((g as any)._id ? g : data));
      },
      enabled: !!id,
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const embellishedGroupItems = await Promise.all(
      group.items.map(async (i) => {
        let imageUrl = "";
        if (i.imageUrl?.includes("|")) {
          const [_, fileSrc] = (i.imageUrl || "").split("|");
          console.info("start", fileSrc);
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
    console.info("save", embellishedGroup);
    const res = await fetch(`${API_URL}/api/groups${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(embellishedGroup),
    }).then((r) => r.json());
    console.info("saved", res);
    nav("/groups");
  }
  console.info("[group]", group);
  return (
    <div>
      <PageHeader>New Group</PageHeader>
      <form
        onSubmit={save}
        className="flex flex-col gap-2 max-w-2xl mx-auto mt-5 items-center"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          {(group.items || []).map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-center items-center gap-1"
            >
              <div>Item {i + 1}</div>
              {item.imageUrl ? (
                <img
                  src={(item.imageUrl.split("|") || [])[0] || ""}
                  className="h-10 aspect-video bg-gray-700 bg-opacity-20 rounded-md"
                />
              ) : null}
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
              <div className="grid grid-cols-4 gap-1 text-xs">
                <Input label="x" className="w-10" disabled />
                <Input label="y" className="w-10" disabled />
                <Input label="z" className="w-10" disabled />
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    const { src, fileSrc } = await takeScreenshot();
                    console.info("[img]", { src, fileSrc });
                    setGroup((g) => {
                      const newItems = g.items
                        .slice(0, i)
                        .concat({
                          ...g.items[i],
                          imageUrl: `${src}|${fileSrc}`,
                        } as any)
                        .concat(g.items.slice(i + 1));
                      return { ...g, items: newItems };
                    });
                  }}
                >
                  <FaCamera />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-2 justify-center items-center">
          <Button
            type="button"
            onClick={() => {
              const newItem: Omit<Item, "owner"> = {
                name: "",
                description: "",
                imageUrl: "",
                precision: 100,
                location: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
              };
              setGroup((g) => ({
                ...g,
                items: g.items.concat(newItem as any),
              }));
            }}
          >
            Add Item
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
