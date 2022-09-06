import { InputHTMLAttributes } from "react";

export default function Input({
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-row">
      <div className="bg-red-300 flex justify-center items-center py-1 px-2 rounded-l-md">
        Label
      </div>
      <input
        className="text-black py-1 px-2 rounded-r-md border-b border-red-200"
        {...inputProps}
      />
    </div>
  );
}
