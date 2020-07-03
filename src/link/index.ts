import debug from "debug";
import fs from "fs-extra";
import path from "path";
const log = debug("link");

export interface LinkOptions {
  root: string;
  oasisRoot: string;
}

export function link(options: LinkOptions) {
  debug.enable("link");
  log("current dir", options.root);
  log("oasis root", options.oasisRoot);
  const nodeModulePath = path.join(options.root, "node_modules");
  fs.ensureDirSync(nodeModulePath);
  const pkgs = getOasisPkgs(options.oasisRoot);

  pkgs.forEach((pkg) => {
    const destPath = path.join(nodeModulePath, pkg.pkgJson.name);
    fs.ensureDirSync(path.dirname(destPath));
    fs.removeSync(destPath);
    fs.symlink(pkg.pkgPath, destPath).catch((e) => console.error(e));
  });
}

function getOasisPkgs(oasisRoot: string) {
  let pkgJson: object | any;
  try {
    pkgJson = require(path.join(oasisRoot, "package.json"));
  } catch (e) {}
  if (!pkgJson || pkgJson.name !== "@alipay/o3-root") {
    throw `Oasis 根路径设置错误 ${oasisRoot}`;
  }
  const pkgsPath = path.join(oasisRoot, "packages");
  const pkgs = fs.readdirSync(pkgsPath).map((dir) => path.join(pkgsPath, dir));
  return pkgs
    .map((pkgPath) => {
      let singlePkgJson: object | any;
      try {
        singlePkgJson = require(path.join(pkgPath, "package.json"));
      } catch (e) {}
      if (!singlePkgJson || singlePkgJson.private === true) {
        return undefined;
      }
      return { pkgPath, pkgJson: singlePkgJson };
    })
    .filter((pkg) => pkg);
}

function removeTnpmLink(pkgs: string[]) {}
