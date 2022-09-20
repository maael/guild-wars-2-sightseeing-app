import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { documentDir, join } from "@tauri-apps/api/path";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";
import { readDir } from "@tauri-apps/api/fs";
import { API_URL } from "../../util";

export function useLocalImageHook() {
  async function takeScreenshot() {
    await invoke("screenshot");
    const docDir = await documentDir();
    const stats = await readDir(await join(docDir, "Guild Wars 2", "Screens"));
    const lastFile = stats[stats.length - 1];
    const converted = convertFileSrc(lastFile.path);
    return { src: converted, fileSrc: lastFile.path };
  }

  async function saveImage(groupId: string, fileSrc: string) {
    console.info("[save]", `${API_URL}/api/image/${groupId}`, fileSrc);
    const formData = Body.form({
      key: "image",
      image: {
        file: fileSrc,
        mime: "image/jpg",
        fileName: "image.jpg",
      },
    });
    console.info("[save][start]", formData);
    const res = await fetch(`${API_URL}/api/image?groupId=${groupId}`, {
      body: formData,
      method: "POST",
      responseType: ResponseType.JSON,
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.info("[saveImage:data]", res.ok, res.status, res.data);
    if (!res.ok) {
      console.error("[saveImage:error]", res.status, res.data as any);
      throw new Error((res.data as any).error || "Unknown error saving image");
    }
    return (res.data as any)?.Location;
  }

  return {
    saveImage,
    takeScreenshot,
  };
}
