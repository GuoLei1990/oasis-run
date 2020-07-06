import path from "path";
import chalk from "chalk";
import fs from "fs";

function modifyExternal(root: string) {
  if (checkIsOasisTWA(root)) {
    console.log(chalk.greenBright("检查到是 oasistwa 目录，正在注释 external"));
    const configContent = getTWAWebConfig(root);
    
  }
}

function checkIsOasisTWA(root: string) {
  let pkg: object | any;
  pkg = require(path.join(root, "packages.json"));
  return pkg.name === "oasistwa";
}

function getTWAWebConfig(root: string) {
  return fs.readFileSync(path.join(root, "app/web/config.js"), { encoding: "utf-8" });
}
