const { promises: fs } = require("fs");
const path = require("path");

const webDir = path.join(process.cwd(), "..", "web");
const webTypes = path.join(webDir, "src", "types.ts");
const appTypes = path.join(process.cwd(), "src", "types.ts");

const appUtils = path.join(process.cwd(), "src", "util.ts");

const tauriConfig = path.join(process.cwd(), "src-tauri", "tauri.conf.json");
(async () => {
  console.info("[types]", `Copying ${webTypes} to ${appTypes}`);
  await fs.copyFile(webTypes, appTypes);
  console.info("[types]", `Copied ${webTypes} to ${appTypes}`);

  console.info("[api-url]", `Overwriting ${appUtils}`);
  const readUtils = await fs.readFile(appUtils, "utf-8");
  await fs.writeFile(
    appUtils,
    readUtils
      .replace("http://localhost:3000", "https://gw2-sightseeing-api.mael.tech")
      .replace(
        "http://localhost:3001",
        "https://gw2-sightseeing-api.mael.tech"
      ),
    "utf-8"
  );
  console.info("[api-url]", `Overwrote ${appUtils}`);

  const githubRef = process.env.GITHUB_REF || "";
  let githubVersion;
  if (githubRef.startsWith("refs/tags/v")) {
    githubVersion = githubRef.replace("refs/tags/v", "").trim();
  }
  const newVersion =
    process.env.APP_VERSION ||
    githubVersion ||
    require("../package.json").version;
  if (newVersion) {
    console.info(
      "[tauri-conf]",
      `Start updating ${tauriConfig} with version ${newVersion}`
    );
    const existingTauriConfig = JSON.parse(
      await fs.readFile(tauriConfig, "utf-8")
    );
    existingTauriConfig.package.version = newVersion.replace("v", "");
    await fs.writeFile(
      tauriConfig,
      JSON.stringify(existingTauriConfig, undefined, 2),
      "utf-8"
    );
    console.info("[tauri-conf]", "Updated");
  } else {
    console.info(
      "[tauri-conf]",
      `Skipping updating ${tauriConfig}, version: ${newVersion}`
    );
  }
})();
