import cls from "classnames";
import toast from "react-hot-toast";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

type ToastType = "success" | "error" | "info";

const IconMap: Record<ToastType, React.ReactNode> = {
  success: <FaCheckCircle className="text-green-600" />,
  info: <FaInfoCircle className="text-blue-500" />,
  error: <FaTimesCircle className="text-red-600" />,
};

const positionMap = {
  "bottom-center": "justify-center flex-end",
  "bottom-right": "justify-end flex-end",
  "bottom-left": "justify-start flex-end",
};

export function CustomToast(t: any, type: ToastType, message: string) {
  return (
    <div className={cls("flex-1 flex", (positionMap as any)[t.position])}>
      <div
        className={cls(
          `max-w-md bg-brushed-black rounded-full pointer-events-none border-2 border-stone-700 text-center flex flex-row justify-center items-center`,
          {
            "animate-enter": t.visible,
            "animate-leave": !t.visible,
            "text-xl px-10 py-3 gap-3": t.size === "xl" || !t.size,
            "text-base px-5 py-2 gap-2": t.size === "base",
            "text-sm px-3 py-2 gap-2": t.size === "sm",
            "text-xs px-3 py-2 gap-2": t.size === "xs",
          }
        )}
      >
        {IconMap[type] || null}
        {message}
      </div>
    </div>
  );
}

export default function customToast(
  type: ToastType,
  message: string,
  options?: Parameters<typeof toast.custom>[1] & {
    size?: "xs" | "sm" | "base" | "xl";
  }
) {
  toast.custom((t) => CustomToast(t, type, message), {
    position: "bottom-center",
    ...(options || {}),
  });
}
