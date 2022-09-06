import { invoke } from "@tauri-apps/api";
import React from "react";

const ConnectionContext = React.createContext<Partial<ConnData>>({});
ConnectionContext.displayName = "ConnectionContext";

type ConnData = Partial<{
  connection: {
    status: "waiting" | "connected";
    data: null | any;
  };
  setConnection: React.Dispatch<React.SetStateAction<ConnData>>;
}>;

export function Provider({ children }: React.PropsWithChildren) {
  const [{ connection }, setConnection] = React.useState<Partial<ConnData>>({});
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const raw: string = await invoke("get_mumble");
      const data = JSON.parse(raw);
      setConnection({
        connection: {
          status:
            data && Object.keys(data).length > 0 ? "connected" : "waiting",
          data,
        },
        setConnection,
      });
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  });
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
