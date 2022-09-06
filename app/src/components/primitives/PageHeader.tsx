import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

export default function PageHeader({ children }: React.PropsWithChildren) {
  const nav = useNavigate();
  return (
    <header className="relative flex flex-row gap-2">
      <button
        className="absolute left-3 top-3 text-2xl"
        onClick={() => nav(-1)}
      >
        <FaChevronLeft />
      </button>
      <h1 className="text-3xl text-center flex-1">{children}</h1>
    </header>
  );
}
