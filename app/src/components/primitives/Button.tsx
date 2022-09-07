import { ButtonHTMLAttributes } from "react";

export default function Button({
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-2.5 py-1 transition-all relative top-0 hover:-top-1 rounded-md shadow-md flex flex-row justify-center items-center gap-1"
      style={{ background: "#584025" }}
      {...buttonProps}
    />
  );
}
