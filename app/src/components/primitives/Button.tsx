import { ButtonHTMLAttributes } from "react";
import cls from "classnames";

export default function Button({
  className,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cls(
        "px-2.5 py-1 gwcursor-btn transition-all relative hover:scale-125 rounded-md shadow-md flex flex-row justify-center items-center gap-1",
        className
      )}
      style={{ background: "#584025" }}
      {...buttonProps}
    />
  );
}
