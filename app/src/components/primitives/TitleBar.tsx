import { appWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useConnection } from "../hooks/useConnection";

export default function TitleBar() {
  const [title, setTitle] = useState("");
  useEffect(() => {
    (async () => {
      setTitle(await getName());
    })();
  }, []);
  const { connection } = useConnection();
  return (
    <>
      <div
        data-tauri-drag-region
        className="bg-gray-900 bg-opacity-25 flex-grow-0 flex-shrink-0 text-white select-none flex flex-row justify-end items-center cursor-move text-sm"
      >
        <div className="absolute top-2 left-2">{title}</div>
        <div>
          {connection?.status === "connected" ? (
            <div
              className="bg-green-600 px-3 py-0.5 text-xs rounded-md mx-5"
              title={JSON.stringify(connection.data)}
            >
              {connection.data.identity.name}
            </div>
          ) : (
            <div className="bg-yellow-600 px-3 py-0.5 text-xs rounded-md mx-5 animate-pulse">
              Waiting...
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
