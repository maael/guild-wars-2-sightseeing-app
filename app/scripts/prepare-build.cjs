const { promises: fs } = require("fs");
const path = require("path");

const webDir = path.join(process.cwd(), "..", "web");
const webTypes = path.join(webDir, "src", "types.ts");
const appTypes = path.join(process.cwd(), "src", "types.ts");

const appUtils = path.join(process.cwd(), "src", "util.ts");
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
})();
