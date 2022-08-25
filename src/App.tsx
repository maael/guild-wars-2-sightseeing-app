import React, { PropsWithChildren, useEffect, useState } from "react";
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { fetch } from "@tauri-apps/api/http";
import TitleBar from "./components/TitleBar";
import "./App.css";

function BaseScreen({ children }: PropsWithChildren) {
  return (
    <div className="container">
      <TitleBar />
      {children}
    </div>
  );
}

function WaitingForConnectionScreen() {
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

  return (
    <BaseScreen>
      <h1>Guild Wars 2 Sightseeing</h1>
      <p>{greetMsg}</p>
    </BaseScreen>
  );
}

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
      setApiAccountInfo(data);
    })();
  }, []);
  return [apiAccountInfo, setApiAccountInfo] as const;
}

function EnterApiKeyScreen() {
  const [apiAccountInfo, setApiAccountInfo] = useApiAccountInfo();
  const nav = useNavigate();
  React.useEffect(() => {
    if (apiAccountInfo) {
      nav("/connected");
    }
  }, [apiAccountInfo]);
  return (
    <BaseScreen>
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
    </BaseScreen>
  );
}

function App() {
  return (
    <Router initialEntries={["/setup"]}>
      <InnerApp />
    </Router>
  );
}

function InnerApp() {
  return (
    <Routes>
      <Route path="/setup" element={<EnterApiKeyScreen />} />
      <Route path="/connected" element={<WaitingForConnectionScreen />} />
    </Routes>
  );
}

export default App;
