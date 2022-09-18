import { invoke } from "@tauri-apps/api";
import React from "react";
import * as Sentry from "@sentry/react";

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
      try {
        const raw: string = await invoke("get_mumble");
        console.info("[useConnection:mumble]", raw);
        const data = JSON.parse(raw || "{}");
        console.info("[useConnection:parsed]", data);
        setConnection({
          connection: {
            status:
              data && Object.keys(data).length > 0 ? "connected" : "waiting",
            data,
          },
          setConnection,
        });
      } catch (e) {
        console.error("[useConnection:error]", e);
        Sentry.captureException(e);
        setConnection((c) => ({
          connection: {
            status: "error",
            data: c.connection?.data,
          },
          setConnection,
        }));
      }
    }, 2_000);
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
