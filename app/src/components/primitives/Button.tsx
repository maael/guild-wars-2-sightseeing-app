import { ButtonHTMLAttributes } from "react";

export default function Button({
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-2 py-1 bg-orange-900 transition-all relative top-0 hover:-top-1 rounded-md shadow-md"
      {...buttonProps}
    />
  );
}
