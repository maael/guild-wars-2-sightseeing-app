import React, { InputHTMLAttributes } from "react";
import cls from "classnames";

export default function Input({
  label,
  labelClassName,
  outerClassName,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelClassName?: React.CSSProperties;
  outerClassName?: React.CSSProperties;
}) {
  return (
    <div className={cls("flex flex-col sm:flex-row", outerClassName)}>
      <div
        style={{ background: "#584025" }}
        className={cls(
          "flex justify-center items-center py-1 px-2 rounded-t-md sm:rounded-l-md sm:rounded-tr-none",
          labelClassName
        )}
      >
        {label}
      </div>
      <input
        {...inputProps}
        style={{ borderColor: "#584025" }}
        className={cls(
          "text-black py-1 px-2 rounded-b-md sm:rounded-r-md sm:rounded-bl-none border-b",
          inputProps.className
        )}
      />
    </div>
  );
}
