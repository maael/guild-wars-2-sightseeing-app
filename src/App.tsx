import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import TitleBar from "./components/TitleBar";

function App() {
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
    <div className="container">
      <TitleBar />
      <h1>Guild Wars 2 Sightseeing</h1>
      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
