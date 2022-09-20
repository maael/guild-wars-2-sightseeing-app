import { invoke } from "@tauri-apps/api/tauri";
import { fetch, ResponseType } from "@tauri-apps/api/http";

export const API_URL = "https://gw2-sightseeing-api.mael.tech";

export const fetchWithKey: typeof fetch = async (path, options) => {
  let opts = options || { method: "GET" };
  opts.responseType = ResponseType.JSON;
  if (typeof path === "string" && path.startsWith(API_URL)) {
    opts.headers = options?.headers || {};
    (opts.headers as any)["X-GW2-ACCOUNT"] =
      localStorage.getItem("gw2-account");
    try {
      const mumbleInfo = await invoke("get_mumble").then((r) =>
        JSON.parse((r as string) || "{}")
      );
      (opts.headers as any)["X-GW2-CHARACTER"] = mumbleInfo?.identity?.name;
    } catch (e) {
      console.error(e);
    }
  }
  const result = await fetch(path, opts);
  if (!result.ok) {
    throw new Error(
      `Failed to fetch: ${(result.data as any)?.error || result.status}`
    );
  }
  return result as any;
};
