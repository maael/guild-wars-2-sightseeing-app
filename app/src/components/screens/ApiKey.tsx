import React from "react";
import { useNavigate } from "react-router-dom";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { fetch } from "@tauri-apps/api/http";
import { FaSave } from "react-icons/fa";
import * as Sentry from "@sentry/react";
import Input from "../primitives/Input";
import Button from "../primitives/Button";
import customToast from "../primitives/CustomToast";

function useApiAccountInfo() {
  const [apiAccountInfo, setApiAccountInfo] = React.useState<{
    apiKey: string;
    accountData?: { name?: string };
  }>(() => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem("gw2-account-info") || "{}"
      );
      if (parsed && parsed.apiKey) {
        console.info("[useApiAccountInfo:setState:hydrate]", parsed);
        return parsed;
      } else {
        console.warn("[useApiAccountInfo:setState:hydrate:missing]");
      }
    } catch (e) {
      console.warn("[useApiAccountInfo:setState:hydrate:error]", e);
    }
    return {
      apiKey: "",
      accountData: {},
    };
  });
  React.useEffect(() => {
    (async () => {
      try {
        const resourcePath = await resolveResource("settings.json");
        const fileData = await readTextFile(resourcePath);
        const data = JSON.parse(fileData || "{}");
        console.info("[useApiAccountInfo]", data);
        localStorage.setItem("gw2-account-info", JSON.stringify(data));
        localStorage.setItem("gw2-account", data?.accountData?.name);
        setApiAccountInfo(data);
      } catch (e) {
        console.warn("[useApiAccountInfo:error]", e);
      }
    })();
  }, []);
  return [apiAccountInfo, setApiAccountInfo] as const;
}

export default function EnterApiKeyScreen() {
  const [apiAccountInfo, setApiAccountInfo] = useApiAccountInfo();
  const [error, setError] = React.useState<Error | null>(null);
  const nav = useNavigate();
  React.useEffect(() => {
    console.info("[apiAccountInfo]", apiAccountInfo);
    if (apiAccountInfo && apiAccountInfo.accountData?.name) {
      const username = apiAccountInfo.accountData?.name || undefined;
      localStorage.setItem("gw2-account", username || "");
      console.info("[username]", username);
      if (username) {
        Sentry.setUser({
          username,
        });
      }
      console.info("[navigate]", "/groups");
      nav("/groups");
    }
  }, [apiAccountInfo]);
  return (
    <div className="mt-10 flex flex-col gap-2 items-center max-w-lg mx-auto">
      <h1 className="text-2xl">Guild Wars 2 Sightseeing</h1>
      <h3 className="text-xl">Setup</h3>
      <h3 className="text-lg">To get started please provide an API Key!</h3>
      <ol className="list-decimal mx-8 mt-2 mb-4 space-y-3">
        <li>
          Go to{" "}
          <a
            className="underline"
            href="https://account.arena.net/applications"
            target="_blank"
          >
            official Guild Wars 2 API Key Management →
          </a>
        </li>
        <li>Click on the "New Key" button</li>
        <li>
          Enter a name and ensure{" "}
          <strong className="border border-white rounded-md px-1 relative text-sm">
            account
          </strong>{" "}
          and{" "}
          <strong className="border border-white rounded-md px-1 relative text-sm">
            characters
          </strong>{" "}
          are ticked, and click on "Create API Key"
        </li>
        <li>Copy your new API key</li>
        <li>Paste it in the form below and hit "Save Key"</li>
      </ol>
      <form
        className="flex flex-col gap-2 justify-center items-center"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            setError(null);
            const apiKey = (
              e.currentTarget.elements.namedItem("api-key") as HTMLInputElement
            ).value.trim();

            const accountData: any = await fetch(
              `https://api.guildwars2.com/v2/account?${new URLSearchParams({
                access_token: apiKey,
              })}`
            ).then((res) => res.data);

            const apiAccountInfo = { apiKey, accountData };
            await writeTextFile(
              "settings.json",
              JSON.stringify(apiAccountInfo),
              {
                dir: BaseDirectory.Resource,
              }
            );
            localStorage.setItem(
              "gw2-account-info",
              JSON.stringify(apiAccountInfo)
            );
            setApiAccountInfo(apiAccountInfo);
          } catch (e) {
            console.error("[EnterApiKeyScreen:submit]", e);
            Sentry.captureException(e);
            customToast(
              "error",
              "There was a problem getting your account information, please try again"
            );
            setError(e as Error);
          }
        }}
      >
        <Input
          label="API Key"
          type="password"
          defaultValue={apiAccountInfo.apiKey}
          placeholder="API Key..."
          name="api-key"
        />
        <Button type="submit">
          <FaSave /> Save Key
        </Button>
      </form>
      <div className="mt-2">
        {apiAccountInfo?.accountData?.name
          ? `Hi ${apiAccountInfo.accountData.name}!`
          : null}
      </div>
      {error ? (
        <div className="text-red-600 mx-2">
          {`Error: ${error} - ${error.stack?.toString()}`}
        </div>
      ) : null}
    </div>
  );
}
