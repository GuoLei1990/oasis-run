import path from "path";
import fs from "fs-extra";

export function clean() {
  const cwd = process.cwd();
  const basePackagePath = path.join(cwd, "packages");

  const packagePathes = fs
    .readdirSync(basePackagePath)
    .map((p: string) => path.join(basePackagePath, p))
    .filter((p: string) => fs.statSync(p).isDirectory())
    .filter((p: string) => !fs.existsSync(path.join(p, "package.json")))
    .forEach((p) => fs.remove(p));
}
