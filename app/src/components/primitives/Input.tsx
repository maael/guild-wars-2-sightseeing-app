import { InputHTMLAttributes } from "react";

export default function Input({
  label,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-row">
      <div className="bg-orange-900 flex justify-center items-center py-1 px-2 rounded-l-md">
        {label}
      </div>
      <input
        className="text-black py-1 px-2 rounded-r-md border-b border-orange-900"
        {...inputProps}
      />
    </div>
  );
}
