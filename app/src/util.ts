import { invoke } from "@tauri-apps/api/tauri";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { removeFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import avatars from "./data/avatars";

export const API_URL = "http://localhost:3001";

export const fetchWithKey: typeof fetch = async (path, options) => {
  console.info("[fetch:start]", path);
  let opts = options || { method: "GET" };
  opts.responseType = ResponseType.JSON;
  if (typeof path === "string" && path.startsWith(API_URL)) {
    opts.headers = options?.headers || {};
    (opts.headers as any)["X-GW2-ACCOUNT"] =
      localStorage.getItem("gw2-account") || "";
    try {
      console.info("[fetch:invoke:start]");
      const mumbleInfo = await invoke("get_mumble")
        .then((r) => JSON.parse((r as string) || "{}"))
        .catch((e) => {
          console.info("[fetch:invoke:catch]", e);
          return {};
        });
      console.info("[fetch:invoke:end]");
      (opts.headers as any)["X-GW2-CHARACTER"] =
        mumbleInfo?.identity?.name || "";
    } catch (e) {
      console.error("[fetchWithkey]", e);
    }
  }
  console.info("[fetch:opts]", opts);
  const result = await fetch(path, opts);
  console.info("[fetch:result]", path, result);
  if (!result.ok) {
    throw new Error(
      `Failed to fetch: ${(result.data as any)?.error || result.status}`
    );
  }
  return result as any;
};

export async function resetSettings() {
  localStorage.clear();
  try {
    const resourcePath = await resolveResource("settings.json");
    await removeFile(resourcePath);
  } catch (e) {
    console.warn(e);
  }
}

function mapCoords(cr: any, mr: any, p: [number, number]) {
  return [
    Math.round(
      cr[0][0] +
        ((cr[1][0] - cr[0][0]) * (p[0] - mr[0][0])) / (mr[1][0] - mr[0][0])
    ),
    Math.round(
      cr[0][1] +
        (cr[1][1] - cr[0][1]) * (1 - (p[1] - mr[0][1]) / (mr[1][1] - mr[0][1]))
    ),
  ];
}

/** Do we need to do this? Doesn't seem to change the produced coords */
const M_TO_INCHES = 39.3701;

export async function getGeoCoords(mumbleData: any) {
  const mapData: any = await fetch(
    `https://api.guildwars2.com/v2/maps/${mumbleData?.context?.map_id}`
  ).then((res) => res.data);
  const locationInInches = {
    x: (mumbleData?.avatar?.position || [])[0] * M_TO_INCHES,
    y: (mumbleData?.avatar?.position || [])[2] * M_TO_INCHES,
  };
  const scaled = mapCoords(mapData?.continent_rect, mapData?.map_rect, [
    locationInInches.x,
    locationInInches.y,
  ]);
  return scaled;
}

export function stringToNumber(str: string) {
  return str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getAvatar(str?: string) {
  if (!str) return `https://gw2-sightseeing.maael.xyz/avatars/Toxx_2BIcon.jpg`;
  const idx = stringToNumber(str) % avatars.length;
  const avatar = avatars[idx];
  return `https://gw2-sightseeing.maael.xyz/avatars/${
    avatar || "Toxx_2BIcon.jpg"
  }`;
}

export const EXPANSIONS = {
  base: {
    ring: {
      outlineColor: "#7e0b02",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "base",
    label: "Base Game",
  },
  livingWorldSeason2: {
    ring: {
      outlineColor: "#000000",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "living-world-season-2",
    label: "Living World: Season 2",
  },
  heartOfThorns: {
    ring: {
      outlineColor: "#6E7814",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "heart-of-thorns",
    label: "Heart of Thorns",
  },
  livingWorldSeason3: {
    ring: {
      outlineColor: "#718777",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "living-world-season-3",
    label: "Living World: Season 3",
  },
  pathOfFire: {
    ring: {
      outlineColor: "#c4014e",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "path-of-fire",
    label: "Path of Fire",
  },
  livingWorldSeason4: {
    ring: {
      outlineColor: "#e15cdd",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "living-world-season-4",
    label: "Living World: Season 4",
  },
  icebroodSaga: {
    ring: {
      outlineColor: "#742c74",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "icebrood-saga",
    label: "The Icebrood Saga",
  },
  endOfDragons: {
    ring: {
      outlineColor: "#19e0ca",
    },
    bg: {
      backgroundColor: "white",
    },
    icon: "end-of-dragons",
    label: "End of Dragons",
  },
};

export const MOUNTS = {
  raptor: {
    icon: "Raptor-Icon-v2",
    label: "Raptor",
    bg: {
      backgroundColor: "#D46B2A",
    },
    ring: {
      outlineColor: "#D46B2A",
    },
  },
  springer: {
    icon: "Springer_2BIcon",
    label: "Springer",
    bg: {
      backgroundColor: "#F1C48B",
    },
    ring: {
      outlineColor: "#F1C48B",
    },
  },
  skimmer: {
    icon: "Skimmer-Icon",
    label: "Skimmer",
    bg: {
      backgroundColor: "#F1C48B",
    },
    ring: {
      outlineColor: "#F1C48B",
    },
  },
  jackal: {
    icon: "Jackal-Icon",
    label: "Jackal",
    bg: {
      backgroundColor: "#FFE463",
    },
    ring: {
      outlineColor: "#FFE463",
    },
  },
  rollerBeetle: {
    icon: "Roller_2BBeetle_2BIcon",
    label: "Roller Beetle",
    bg: {
      backgroundColor: "#A1D7F9",
    },
    ring: {
      outlineColor: "#A1D7F9",
    },
  },
  griffon: {
    icon: "Griffon_2BIcon",
    label: "Griffon",
    bg: {
      backgroundColor: "#772309",
    },
    ring: {
      outlineColor: "#772309",
    },
  },
  skyscale: {
    icon: "Skyscale_2BIcon",
    label: "Skyscale",
    bg: {
      backgroundColor: "#B7D1D0",
    },
    ring: {
      outlineColor: "#B7D1D0",
    },
  },
  siegeTurtle: {
    icon: "Siege-Turtle-Icon",
    label: "Siege Turtle",
    bg: {
      backgroundColor: "#311315",
    },
    ring: {
      outlineColor: "#311315",
    },
  },
};
