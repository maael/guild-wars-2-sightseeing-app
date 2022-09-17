import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import cls from "classnames";

export default function PageHeader({
  children,
  backNav,
  hideBack,
  rightAction,
  rightClassName,
}: React.PropsWithChildren<{
  backNav?: string;
  hideBack?: boolean;
  rightAction?: React.ReactNode;
  rightClassName?: string;
}>) {
  const nav = useNavigate();
  return (
    <header className="relative flex flex-row gap-2">
      {hideBack ? null : (
        <button
          className="absolute left-3 top-2 text-2xl"
          onClick={() => nav(backNav || (-1 as any))}
        >
          <FaChevronLeft />
        </button>
      )}
      <h1 className="text-3xl text-center flex-1">{children}</h1>
      <div className={cls("absolute right-3 top-2 z-50", rightClassName)}>
        {rightAction}
      </div>
    </header>
  );
}
