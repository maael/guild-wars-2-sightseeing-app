import { invoke } from "@tauri-apps/api";
import React from "react";
import * as Sentry from "@sentry/react";
import { getGeoCoords } from "../../util";

const ConnectionContext = React.createContext<Partial<ConnData>>({});
ConnectionContext.displayName = "ConnectionContext";

type ConnData = Partial<{
  connection: {
    status: "waiting" | "connected" | "error";
    data: null | any;
  };
  setConnection: React.Dispatch<React.SetStateAction<ConnData>>;
}>;

export function Provider({ children }: React.PropsWithChildren) {
  const [{ connection }, setConnection] = React.useState<Partial<ConnData>>({});
  React.useEffect(() => {
    const interval = setInterval(async () => {
      let raw: string = "";
      try {
        raw = await invoke("get_mumble");
        console.info("[useConnection:mumble]");
        const data = JSON.parse(raw || "{}");
        console.info("[useConnection:parsed]", data);
        // TODO: Remove
        void getGeoCoords(data);
        const status =
          data && Object.keys(data).length > 0
            ? !!data.error
              ? "error"
              : "connected"
            : "waiting";
        setConnection({
          connection: {
            status,
            data,
          },
          setConnection,
        });
      } catch (e) {
        console.error("[useConnection:error]", e, raw);
        Sentry.captureException(e);
        setConnection((c) => ({
          connection: {
            status: "error",
            data: c.connection?.data,
          },
          setConnection,
        }));
      }
    }, 5_000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <ConnectionContext.Provider value={{ connection, setConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return React.useContext(ConnectionContext);
}

export const Consumer = ConnectionContext.Consumer;
