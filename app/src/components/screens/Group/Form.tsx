import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Group, WithRating, GroupDocument } from "../../../types";
import PageHeader from "../../primitives/PageHeader";
import Input from "../../primitives/Input";

export default function GroupFormScreen() {
  const nav = useNavigate();

  const [group, setGroup] = React.useState<
    Omit<Group, "creator" | "isActive" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    bannerimageUrl: "",
    difficulty: 3,
    items: [],
    masteries: [],
    expansions: [],
  });

  const { id } = useParams();
  useQuery<WithRating<GroupDocument>>(
    [`group/${id}`],
    () =>
      fetch(`http://localhost:3000/api/groups/${id}`).then((res) => res.json()),
    {
      onSuccess: (data) => {
        setGroup(data);
      },
      enabled: !!id,
    }
  );

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.info("save", group);
    const res = await fetch(`http://localhost:3000/api/groups`, {
      method: "POST",
      body: JSON.stringify(group),
    }).then((r) => r.json());
    console.info("saved", res);
    nav("/groups");
  }
  return (
    <div>
      <PageHeader>New Group</PageHeader>
      <form onSubmit={save}>
        <Input
          placeholder="Name..."
          value={group.name}
          onChange={(e) => setGroup((g) => ({ ...g, name: e.target.value }))}
        />
        <Input
          placeholder="Description..."
          value={group.description}
          onChange={(e) =>
            setGroup((g) => ({ ...g, description: e.target.value }))
          }
        />

        {group.items.map((_, i) => (
          <div key={i}>
            <input placeholder="Name..." />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setGroup((g) => ({ ...g, items: g.items.concat({}) }))}
        >
          Add Item
        </button>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
