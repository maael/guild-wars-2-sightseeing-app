import toast from "react-hot-toast";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type ToastType = "success" | "error";

const IconMap: Record<ToastType, React.ReactNode> = {
  success: <FaCheckCircle className="text-green-600 text-2xl" />,
  error: <FaTimesCircle className="text-red-600 text-2xl" />,
};

export function CustomToast(t: any, type: ToastType, message: string) {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md bg-brushed-black rounded-full pointer-events-none border-2 border-stone-700 text-xl px-10 py-3 text-center mx-auto flex flex-row gap-3 justify-center items-center`}
    >
      {IconMap[type] || null}
      {message}
    </div>
  );
}

export default function customToast(
  type: ToastType,
  message: string,
  options?: Parameters<typeof toast.custom>[1]
) {
  toast.custom((t) => CustomToast(t, type, message), {
    position: "bottom-center",
    ...(options || {}),
  });
}
