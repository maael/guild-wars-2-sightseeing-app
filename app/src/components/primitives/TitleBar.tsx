import { appWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { FaEye, FaSpinner } from "react-icons/fa";
import cls from "classnames";
import { useConnection } from "../hooks/useConnection";

export default function TitleBar() {
  const [title, setTitle] = useState("");
  useEffect(() => {
    (async () => {
      setTitle(await getName());
    })();
  }, []);
  const [accountName, setAccountName] = useState(() =>
    localStorage.getItem("gw2-account")
  );
  useEffect(() => {
    if (accountName) return;
    const interval = setInterval(() => {
      if (!localStorage.getItem("gw2-account")) return;
      setAccountName(localStorage.getItem("gw2-account"));
      clearInterval(interval);
    }, 2_000);
    return () => {
      clearInterval(interval);
    };
  }, [accountName]);
  const { connection } = useConnection();
  return (
    <>
      <div
        data-tauri-drag-region
        className="bg-gray-900 bg-opacity-25 flex-grow-0 flex-shrink-0 text-white select-none flex flex-row justify-end items-center cursor-move text-sm"
      >
        <div className="absolute top-2 left-3 select-none pointer-events-none flex flex-row gap-1">
          <FaEye /> <span className="hidden sm:inline">{title}</span>
        </div>
        <div className="pointer-events-none">
          {accountName ? (
            <div
              className="bg-green-600 px-3 py-0.5 text-xs rounded-md ml-5 text-ellipsis overflow-hidden whitespace-nowrap"
              style={{ maxWidth: 100 }}
            >
              {accountName}
            </div>
          ) : null}
        </div>
        <div>
          {connection?.status === "connected" ? (
            <div
              className="bg-green-600 px-3 py-0.5 text-xs rounded-md mx-2 text-ellipsis overflow-hidden whitespace-nowrap"
              style={{ maxWidth: 100 }}
              title={JSON.stringify(connection.data)}
            >
              {connection?.data?.identity?.name}
            </div>
          ) : (
            <div
              className={cls(
                " px-3 py-0.5 text-xs rounded-md flex flex-row gap-1 justify-center items-center mx-2 animate-pulse",
                {
                  "bg-yellow-600":
                    !connection ||
                    connection?.status === "waiting" ||
                    connection?.status === "error",
                }
              )}
              title={JSON.stringify(
                connection?.data?.error || connection?.data
              )}
            >
              <FaSpinner className="animate-spin" /> Character...
            </div>
          )}
        </div>
        <div
          className="inline-flex justify-center items-center w-7 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          id="titlebar-minimize"
          onClick={() => appWindow.minimize()}
        >
          <img src="/ui/minimize_button.png" alt="minimize" />
        </div>
        <div
          className="inline-flex justify-center items-center w-7 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          id="titlebar-maximize"
          onClick={() => appWindow.maximize()}
        >
          <img src="/ui/maximize_button.png" alt="maximize" />
        </div>
        <div
          className="inline-flex justify-center items-center w-7 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          id="titlebar-close"
          onClick={() => appWindow.close()}
        >
          <img src="/ui/close_button.png" alt="close" />
        </div>
      </div>
    </>
  );
}
