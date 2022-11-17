const path = require("path");
const rcedit = require("rcedit");

const appDir = path.join(process.cwd(), "..", "app");

(async () => {
  rcedit(
    path.join(
      appDir,
      "src-tauri",
      "target",
      "release",
      "Guild Wars 2 Sightseeing.exe"
    ),
    {
      icon: path.join(appDir, "src-tauri", "icons", "icon.ico"),
    }
  );
})();
