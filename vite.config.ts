import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

function gitCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: "/cheminformatics-workbench/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "docs",
    assetsDir: "assets",
    emptyOutDir: false,
    sourcemap: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(gitCommit()),
    __REPO_URL__: JSON.stringify(
      "https://github.com/baditaflorin/cheminformatics-workbench",
    ),
    __PAYPAL_URL__: JSON.stringify(
      "https://www.paypal.com/paypalme/florinbadita",
    ),
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: "./src/test/setup.ts",
  },
});
