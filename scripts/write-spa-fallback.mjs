import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

mkdirSync("docs", { recursive: true });
copyFileSync("docs/index.html", "docs/404.html");
writeFileSync("docs/.nojekyll", "");
writeFileSync(
  "docs/version.json",
  `${JSON.stringify(
    {
      version: process.env.npm_package_version ?? "0.1.0",
      commit: process.env.VITE_APP_COMMIT ?? "build-time",
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);
mkdirSync(dirname("docs/data/.keep"), { recursive: true });
writeFileSync("docs/data/.keep", "");
