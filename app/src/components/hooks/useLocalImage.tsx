import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { documentDir, join } from "@tauri-apps/api/path";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";
import { readBinaryFile, readDir } from "@tauri-apps/api/fs";
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
    let file = await readBinaryFile(fileSrc);
    try {
      console.info("[jimp]", "start");
      const Jimp = (window as any).Jimp;
      const image = await Jimp.read(file.buffer);
      const compressed = await image
        .contain(1920, 1080)
        .quality(75)
        .getBufferAsync(Jimp.MIME_JPEG);
      file = new Uint8Array(compressed);
      console.info("[jimp]", "done");
    } catch (e) {
      console.warn("[jimp]", e);
    }
    const formData = Body.bytes(file);
    console.info("[save][start]", formData);
    const res = await fetch(`${API_URL}/api/image?groupId=${groupId}`, {
      body: formData,
      method: "POST",
      responseType: ResponseType.JSON,
      headers: {
        "x-api-version": "2",
      },
    });
    console.info("[saveImage:data]", res.ok, res.status, res.data);
    if (!res.ok) {
      console.error("[saveImage:error]", res.status, res.data as any);
      throw new Error((res.data as any).error || "Unknown error saving image");
    }
    return (res.data as any)?.Location.replace(
      "https://s3.us-west-2.amazonaws.com/gw2-sightseeing.maael.xyz",
      "https://gw2-sightseeing.maael.xyz"
    ).replace(
      "https://s3.us-east-1.amazonaws.com/gw2-sightseeing.mael-cdn.com",
      "https://gw2-sightseeing.mael-cdn.com"
    );
  }

  return {
    saveImage,
    takeScreenshot,
  };
}
