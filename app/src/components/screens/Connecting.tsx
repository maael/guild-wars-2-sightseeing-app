import React, { useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { documentDir, join } from "@tauri-apps/api/path";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";
import { readDir, readBinaryFile } from "@tauri-apps/api/fs";

function LocalImage({ ts }: { ts: number }) {
  const [src, setSrc] = React.useState("");
  const [fileSrc, setFileSrc] = React.useState("");
  React.useEffect(() => {
    (async () => {
      const docDir = await documentDir();
      const stats = await readDir(
        await join(docDir, "Guild Wars 2", "Screens")
      );
      const lastFile = stats[stats.length - 1];
      const converted = convertFileSrc(lastFile.path);
      console.info({ converted });
      setFileSrc(lastFile.path);
      setSrc(converted);
    })();
  }, [ts]);

  return (
    <>
      <button
        onClick={async () => {
          console.info("[save]", src);
          const file = await readBinaryFile(fileSrc);
          const formData = Body.form({
            key: "image",
            image: {
              file,
              mime: "image/jpg",
              fileName: "image.jpg",
            },
          });
          const res = await fetch("http://localhost:3000/api/image/1234", {
            body: formData,
            method: "POST",
            responseType: ResponseType.JSON,
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.info("data", res.data);
        }}
      >
        Save
      </button>
      <img style={{ height: "auto", width: 500, margin: "0 auto" }} src={src} />
    </>
  );
}

export default function WaitingForConnectionScreen() {
  const [greetMsg, setGreetMsg] = useState("Waiting...");

  useEffect(() => {
    const interval = setInterval(async () => {
      const raw: string = await invoke("get_mumble");
      const data = JSON.parse(raw);
      setGreetMsg(data.name ? `Hello ${data.identity.name}!` : "Waiting...");
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  });

  const [ts, setTs] = React.useState(0);

  return (
    <>
      <h1>Guild Wars 2 Sightseeing</h1>
      <p>{greetMsg}</p>
      <button
        onClick={async () => {
          const raw: { nanos_since_epoch: number } = await invoke("screenshot");
          console.info({ raw });
          setTs(raw.nanos_since_epoch);
        }}
      >
        Capture
      </button>
      <LocalImage ts={ts} />
    </>
  );
}
