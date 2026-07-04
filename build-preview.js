const fs = require("fs");
const path = require("path");

const cssFiles = [
  "src/styles/base.css",
  "src/styles/theme.css",
  "src/styles/components.css",
  "src/styles/modules.css",
];

const allCSS = cssFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

const loaded = new Set();

function resolvePath(base, importPath) {
  let p = path.resolve(path.dirname(base), importPath);
  if (!path.extname(p)) p += ".js";
  return p;
}

function readJS(filepath) {
  if (loaded.has(filepath)) return "";
  loaded.add(filepath);
  let content = fs.readFileSync(filepath, "utf8");
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"](\.[^'"]+)['"]\s*;?/g,
    (m, names, relPath) => {
      const abs = resolvePath(filepath, relPath);
      return readJS(abs);
    }
  );
  return content;
}

let appJS = readJS("src/app.js");
appJS = appJS.replace(/^export\s+/gm, "").replace(/^import\s+.*$/gm, "");

let html = fs.readFileSync("index.html", "utf8");
html = html.replace(/<link[^>]*>/gi, "");
html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
html = html.replace("</head>", "<style>\n" + allCSS + "\n</style>\n</head>");
html = html.replace("</body>", "<script>\n" + appJS + "\n</script>\n</body>");

fs.writeFileSync("preview.html", html);
console.log("Done: " + Buffer.byteLength(html, "utf8") + " bytes");
console.log("Files: " + [...loaded].join(", "));
