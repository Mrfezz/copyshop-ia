import fs from "node:fs";
import pngToIco from "png-to-ico";

const sizes = [16, 32, 48, 64, 128, 256];
const srcs = sizes.map((s) => `.tmp-favicon/${s}.png`);

const buf = await pngToIco(srcs);
fs.writeFileSync("app/favicon.ico", buf);

console.log("✅ app/favicon.ico généré");
