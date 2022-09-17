import { invoke } from "@tauri-apps/api/tauri";

export const API_URL = "http://localhost:3000";

export const fetchWithKey: typeof fetch = async (path, options) => {
  let opts = options;
  if (typeof path === "string" && path.startsWith(API_URL)) {
    opts = opts || { method: "GET" };
    opts.headers = options?.headers || {};
    (opts.headers as any)["X-GW2-ACCOUNT"] =
      localStorage.getItem("gw2-account");
    try {
      const mumbleInfo = await invoke("get_mumble").then((r) =>
        JSON.parse(r as string)
      );
      (opts.headers as any)["X-GW2-CHARACTER"] = mumbleInfo?.identity?.name;
    } catch (e) {
      console.error(e);
    }
  }
  return fetch(path, opts);
};
