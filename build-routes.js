const fs = require("fs");

const routes = ["dashboard", "project", "reading", "listening", "checkin", "profile"];

routes.forEach((route) => {
  let html = fs.readFileSync("preview.html", "utf8");
  html = html.replace('navigate("dashboard")', `navigate("${route}")`);
  fs.writeFileSync(`preview-${route}.html`, html);
  console.log(`preview-${route}.html written`);
});

// Also generate comprehension-mode previews
["reading", "listening"].forEach((route) => {
  let html = fs.readFileSync("preview.html", "utf8");
  html = html.replace('navigate("dashboard")', `navigate("${route}", { mode: "comprehension" })`);
  fs.writeFileSync(`preview-${route}-comprehension.html`, html);
  console.log(`preview-${route}-comprehension.html written`);
});
