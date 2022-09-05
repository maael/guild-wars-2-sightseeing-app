import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Group } from "../../../types";
import PageHeader from "../../primitives/PageHeader";

export default function GroupFormScreen() {
  const location = useLocation();
  const nav = useNavigate();
  console.info("what", location);
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
  console.info("hi");
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
        <input
          placeholder="Name..."
          value={group.name}
          onChange={(e) => setGroup((g) => ({ ...g, name: e.target.value }))}
        />
        <input
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
