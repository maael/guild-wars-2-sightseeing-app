import { appWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import {
  FaEye,
  FaHome,
  FaQuestionCircle,
  FaSpinner,
  FaUpload,
} from "react-icons/fa";
import cls from "classnames";
import { useConnection } from "../hooks/useConnection";
import {
  API_URL,
  fetchWithKey,
  getAvatar,
  getGeoCoords,
  wait,
} from "../../util";
import { useNavigate } from "react-router-dom";
import customToast from "./CustomToast";
import { invoke } from "@tauri-apps/api/tauri";
import { useLocalImageHook } from "../hooks/useLocalImage";
import { Body } from "@tauri-apps/api/http";

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
  const navigate = useNavigate();
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
              className="bg-green-600 px-3 py-0.5 text-xs rounded-md ml-5 text-ellipsis overflow-hidden whitespace-nowrap flex flex-row gap-1 justify-center items-center"
              style={{ maxWidth: 100 }}
            >
              <img
                className="rounded-full h-4 w-4"
                src={getAvatar(accountName)}
              />
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
          className="inline-flex justify-center items-center w-6 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          onClick={() => navigate("/groups")}
          title="Home"
        >
          <FaHome />
        </div>
        <GeoguesserSubmitButton accountName={accountName} />
        <div
          className="inline-flex justify-center items-center w-6 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
          onClick={() => navigate("/about")}
          title="About"
        >
          <FaQuestionCircle />
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
          onClick={async () =>
            (await appWindow.isMaximized())
              ? appWindow.unmaximize()
              : appWindow.maximize()
          }
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

function GeoguesserSubmitButton({
  accountName,
}: {
  accountName?: string | null;
}) {
  const [saving, setSaving] = useState(false);
  const { takeScreenshot, saveImage } = useLocalImageHook();
  return accountName ? (
    <div
      className="inline-flex justify-center items-center w-6 h-7 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
      onClick={async () => {
        try {
          setSaving(true);
          customToast("info", "Starting submitting Geoguesser suggestion...", {
            size: "sm",
            duration: 1_000,
          });
          await wait(1_000);
          customToast(
            "info",
            "Will swap to Guild Wars 2, hide UI, and take screenshot...",
            { size: "sm", duration: 2_000 }
          );
          const [{ fileSrc }, data] = await Promise.all([
            takeScreenshot(),
            invoke("get_mumble").then((raw) =>
              JSON.parse((raw as string) || "{}")
            ),
          ]);
          const location = await getGeoCoords(data);
          const image = await saveImage("geoguesser", fileSrc);
          console.info("[submission]", {
            location,
            accountName,
            image,
          });
          const result = await fetchWithKey(`${API_URL}/api/geoguesser`, {
            method: "POST",
            body: Body.json({
              location,
              accountName,
              image,
            }),
          });
          if (result.ok) {
            customToast("success", "Submitted Geoguesser suggestion!", {
              size: "sm",
              duration: 1_000,
            });
          } else {
            customToast("error", "Failed to submit Geoguesser suggestion!", {
              size: "sm",
              duration: 3_000,
            });
          }
        } catch (e) {
          console.warn(e);
          customToast("error", "Failed to submit Geoguesser suggestion!", {
            size: "sm",
            duration: 5_000,
          });
        } finally {
          setSaving(false);
        }
      }}
      title="Submit to GW2 Geoguesser"
    >
      {saving ? <FaSpinner className="animate-spin" /> : <FaUpload />}
    </div>
  ) : null;
}
