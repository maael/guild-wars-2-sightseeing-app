import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

export default function PageHeader({
  children,
  backNav,
  rightAction,
}: React.PropsWithChildren<{
  backNav?: string;
  rightAction?: React.ReactNode;
}>) {
  const nav = useNavigate();
  return (
    <header className="relative flex flex-row gap-2">
      <button
        className="absolute left-3 top-2 text-2xl"
        onClick={() => nav(backNav || (-1 as any))}
      >
        <FaChevronLeft />
      </button>
      <h1 className="text-3xl text-center flex-1">{children}</h1>
      <div className="absolute right-3 top-2">{rightAction}</div>
    </header>
  );
}
