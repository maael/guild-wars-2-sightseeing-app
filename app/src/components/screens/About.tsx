import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { resolveResource } from "@tauri-apps/api/path";
import { removeFile } from "@tauri-apps/api/fs";
import { fetch } from "@tauri-apps/api/http";
import React, { useEffect, useState } from "react";
import {
  FaBeer,
  FaChevronLeft,
  FaDownload,
  FaEye,
  FaGithub,
  FaLink,
  FaSpinner,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import gtr from "semver/ranges/gtr";
import { API_URL } from "../../util";
import Button from "../primitives/Button";
import customToast from "../primitives/CustomToast";

export default function AboutScreen() {
  const navigate = useNavigate();
  const [details, setDetails] = useState<{
    appVersion?: string;
    tauriVersion?: string;
  }>({});
  useEffect(() => {
    (async () => {
      const [appVersion, tauriVersion] = await Promise.all([
        getVersion(),
        getTauriVersion(),
      ]);
      setDetails({ appVersion, tauriVersion });
    })();
  }, []);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  return (
    <div className="px-3 flex flex-col flex-1">
      <div className="relative text-3xl flex flex-row gap-1 text-center justify-center items-center w-full p-5 mb-2">
        <FaChevronLeft
          className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl gwcursor-btn hover:scale-110"
          onClick={() => {
            navigate(-1);
          }}
        />
        <h1>About</h1>
      </div>
      <div className="flex flex-col justify-center items-center gap-4 text-lg text-center">
        <div className="flex flex-row gap-1 justify-center items-center">
          <img
            src="https://gw2-sightseeing.maael.xyz/avatars/Gorrik-Icon.jpg"
            className="rounded-full w-5 h-5"
          />
          Mael.3259 in game
        </div>
        <div>
          <a
            href="https://github.com/maael/guild-wars-2-sightseeing-app"
            target="_blank"
            className="flex flex-row gap-1 justify-center items-center"
          >
            <FaGithub />
            Source Code
          </a>
        </div>
        <div>
          <a href="https://elonian-gallery.com/" target="_blank">
            Avatars ?? Ilona Iske 2022
          </a>
        </div>
        <div>
          <a
            href="https://mael.tech/gw2"
            target="_blank"
            className="flex flex-row gap-1 justify-center items-center"
          >
            <FaLink /> Find other Guild Wars 2 things I've made here!
          </a>
        </div>
        <div>
          <a
            href="https://www.buymeacoffee.com/matte"
            target="_blank"
            className="flex flex-row gap-1 justify-center items-center"
          >
            <FaLink />
            Enjoying the game? Get me a beer. <FaBeer />
          </a>
        </div>
        <Button
          className="m-2"
          onClick={async () => {
            try {
              setChecking(true);
              const updateInfo = await fetch(`${API_URL}/api/update-info`);
              if (!updateInfo.ok) {
                throw new Error("Error getting update info");
              }
              const isNewer =
                details.appVersion && updateInfo.data
                  ? gtr((updateInfo.data as any).version, details.appVersion)
                  : !!updateInfo.data;
              setUpdateInfo({ ...((updateInfo.data as any) || {}), isNewer });
              customToast(
                "success",
                isNewer
                  ? "Found latest version!"
                  : "You're on the latest version!",
                {
                  size: "sm",
                  duration: 1_000,
                }
              );
            } catch (e) {
              customToast(
                "error",
                "Failed to check for update, please try again!"
              );
            } finally {
              setChecking(false);
            }
          }}
        >
          {checking ? <FaSpinner className="animate-spin" /> : <FaUpload />}{" "}
          Check for update
        </Button>
        {updateInfo ? (
          <div className="flex flex-col gap-3 justify-center items-center">
            <div>Latest Version: v{updateInfo.version}</div>
            {updateInfo.isNewer ? (
              <>
                <a href={updateInfo.downloadLink} target="_blank">
                  <Button>
                    <FaDownload /> Download
                  </Button>
                </a>
                <a href={updateInfo.viewLink} target="_blank">
                  <Button>
                    <FaEye /> View
                  </Button>
                </a>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex-1" />
      <div className="mb-24 flex flex-col gap-2 justify-center items-center opacity-50 hover:opacity-100 transition-all">
        <Button
          className="!bg-red-600 text-xs"
          onClick={async () => {
            localStorage.clear();
            const resourcePath = await resolveResource("settings.json");
            await removeFile(resourcePath);
            window.location.reload();
          }}
        >
          <FaTimes /> Reset App
        </Button>
        <div className="max-w-xs text-center text-xs">
          This will log you out, but progress associated with the Account Name
          won't be lost
        </div>
      </div>
      <div className="absolute bottom-10 right-5">
        <div>App Version: v{details.appVersion || "?.?.?"}</div>
        <div>Tauri Version: v{details.tauriVersion || "?.?.?"}</div>
      </div>
    </div>
  );
}
