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
          <img src="/ui/minimize_button.png" alt="minimize" />
        </div>
        <div
          className="titlebar-button"
          id="titlebar-maximize"
          onClick={() => appWindow.maximize()}
        >
          <img src="/ui/maximize_button.png" alt="maximize" />
        </div>
        <div
          className="titlebar-button"
          id="titlebar-close"
          onClick={() => appWindow.close()}
        >
          <img src="/ui/close_button.png" alt="close" />
        </div>
      </div>
      <div className="titlebar-placeholder" />
    </>
  );
}
