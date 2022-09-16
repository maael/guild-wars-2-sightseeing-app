import React from "react";
import { useNavigate } from "react-router-dom";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { fetch } from "@tauri-apps/api/http";

function useApiAccountInfo() {
  const [apiAccountInfo, setApiAccountInfo] = React.useState<{
    apiKey: string;
    accountData?: { name?: string };
  }>({
    apiKey: "",
    accountData: {},
  });
  React.useEffect(() => {
    (async () => {
      const resourcePath = await resolveResource("settings.json");
      const data = JSON.parse(await readTextFile(resourcePath));
      console.info("what", data);
      localStorage.setItem("gw2-account", data?.accountData?.name);
      setApiAccountInfo(data);
    })();
  }, []);
  return [apiAccountInfo, setApiAccountInfo] as const;
}

export default function EnterApiKeyScreen() {
  const [apiAccountInfo, setApiAccountInfo] = useApiAccountInfo();
  const nav = useNavigate();
  React.useEffect(() => {
    if (apiAccountInfo) {
      nav("/groups");
    }
  }, [apiAccountInfo]);
  return (
    <>
      <h1>Guild Wars 2 Sightseeing</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const apiKey = (
            e.currentTarget.elements.namedItem("api-key") as HTMLInputElement
          ).value.trim();

          const accountData: any = await fetch(
            `https://api.guildwars2.com/v2/account?${new URLSearchParams({
              access_token: apiKey,
            })}`
          ).then((res) => res.data);

          const apiAccountInfo = { apiKey, accountData };
          await writeTextFile("settings.json", JSON.stringify(apiAccountInfo), {
            dir: BaseDirectory.Resource,
          });
          setApiAccountInfo(apiAccountInfo);
        }}
      >
        <input
          type="password"
          style={{ background: "#333333" }}
          defaultValue={apiAccountInfo.apiKey}
          placeholder="API Key..."
          name="api-key"
        />
        <button type="submit">Save Key</button>
      </form>
      {apiAccountInfo?.accountData?.name
        ? `Hi ${apiAccountInfo.accountData.name}!`
        : null}
    </>
  );
}