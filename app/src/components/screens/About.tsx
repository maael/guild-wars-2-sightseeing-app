import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import React, { useEffect, useState } from "react";
import {
  FaBeer,
  FaChevronLeft,
  FaDownload,
  FaGithub,
  FaLink,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
  return (
    <div className="px-3">
      <div className="relative text-3xl flex flex-row gap-1 text-center justify-center items-center w-full p-5 mb-2">
        <FaChevronLeft
          className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl cursor-pointer hover:scale-110"
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
            Avatars © Ilona Iske 2022
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
          onClick={() => {
            customToast("success", "No update found!");
          }}
        >
          <FaDownload /> Check for update
        </Button>
      </div>
      <div className="absolute bottom-10 right-5">
        <div>App Version: v{details.appVersion || "?.?.?"}</div>
        <div>Tauri Version: v{details.tauriVersion || "?.?.?"}</div>
      </div>
    </div>
  );
}
