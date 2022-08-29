import { appWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import "./index.css";
import { useEffect, useState } from "react";

export default function TitleBar() {
  const [title, setTitle] = useState("");
  useEffect(() => {
    (async () => {
      setTitle(await getName());
    })();
  }, []);
  return (
    <>
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-left">{title}</div>
        <div
          className="titlebar-button"
          id="titlebar-minimize"
          onClick={() => appWindow.minimize()}
        >
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            alt="minimize"
          />
        </div>
        <div
          className="titlebar-button"
          id="titlebar-maximize"
          onClick={() => appWindow.maximize()}
        >
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            alt="maximize"
          />
        </div>
        <div
          className="titlebar-button"
          id="titlebar-close"
          onClick={() => appWindow.close()}
        >
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div>
      </div>
      <div className="titlebar-placeholder" />
    </>
  );
}
