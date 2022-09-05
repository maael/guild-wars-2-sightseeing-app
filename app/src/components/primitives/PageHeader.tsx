import React from "react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ children }: React.PropsWithChildren) {
  const nav = useNavigate();
  return (
    <header className="relative flex flex-row gap-2">
      <button className="absolute left-3 top-3" onClick={() => nav(-1)}>
        {"<"}
      </button>
      <h1 className="text-3xl text-center flex-1">{children}</h1>
    </header>
  );
}
