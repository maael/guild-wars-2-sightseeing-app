import { invoke } from "@tauri-apps/api/tauri";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import { removeFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";

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
