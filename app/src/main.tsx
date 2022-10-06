import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { Body, fetch } from "@tauri-apps/api/http";
import App from "./App";
import "./style.css";
// import { resetSettings } from "./util";

Sentry.init({
  dsn: "https://aceac5b32b7c482d81fc038a64075e05@o304997.ingest.sentry.io/6756834",
  transport: (options) =>
    Sentry.createTransport(
      { recordDroppedEvent: (r) => console.error("Dropped Sentry event", r) },
      (req) => {
        return new Promise(async (resolve, reject) => {
          console.info("[sentry][start]", req);
          try {
            const result = await fetch(options.url, {
              method: "POST",
              timeout: 10,
              body:
                typeof req.body === "string"
                  ? Body.text(req.body)
                  : Body.bytes(req.body as unknown as ArrayLike<number>),
            });
            console.info("[sentry][done]", result.status, result.data);
            if (!result.ok) {
              throw new Error((result.data as any) || "Unknown error");
            }
            resolve({
              statusCode: result.status,
              headers: {
                "retry-after": result.headers["retry-after"],
                "x-sentry-rate-limits": result.headers["x-sentry-rate-limits"],
              },
            });
          } catch (e) {
            console.error(e);
            reject(e);
          }
        });
      }
    ),
});

// resetSettings().then(() => {
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// });
