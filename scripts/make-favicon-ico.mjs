import fs from "node:fs";
import pngToIco from "png-to-ico";

const srcs = [
  "public/favicon-16x16.png",
  "public/favicon-32x32.png",
  "public/favicon-48x48.png",
];

const buf = await pngToIco(srcs);
fs.writeFileSync("public/favicon.ico", buf);

console.log("✅ public/favicon.ico généré");
