import React from "react";

export default function GroupFormScreen() {
  console.info("hi");
  const [items, setItems] = React.useState([{}]);
  return (
    <div>
      <h1>New Group</h1>
      <input placeholder="Name..." />
      <input placeholder="Description..." />

      {items.map((_, i) => (
        <div key={i}>
          <input placeholder="Name..." />
        </div>
      ))}
      <button onClick={() => setItems((i) => i.concat({}))}>Add Item</button>
      <button>Save</button>
    </div>
  );
}
