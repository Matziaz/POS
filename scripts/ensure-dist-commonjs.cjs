const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "..", "dist");
const packageJsonPath = path.join(distDir, "package.json");

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
  "utf8"
);

console.log(`[electron] Ensured CommonJS scope at ${packageJsonPath}`);
