const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = packageJson.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`package.json version must use major.minor.patch, received: ${version}`);
}

function replaceVersion(filePath, pattern, replacement) {
  const content = fs.readFileSync(filePath, "utf8");
  if (!pattern.test(content)) {
    throw new Error(`Could not find a version field in ${filePath}`);
  }
  pattern.lastIndex = 0;
  const next = content.replace(pattern, replacement);
  if (next !== content) fs.writeFileSync(filePath, next);
}

replaceVersion(
  path.join(root, "src", "config", "app-meta.js"),
  /version: "[^"]+"/,
  `version: "${version}"`
);
replaceVersion(
  path.join(root, "src-tauri", "tauri.conf.json"),
  /"version": "[^"]+"/,
  `"version": "${version}"`
);
replaceVersion(
  path.join(root, "src-tauri", "Cargo.toml"),
  /^version = "[^"]+"/m,
  `version = "${version}"`
);

console.log(`Synced application version: ${version}`);
