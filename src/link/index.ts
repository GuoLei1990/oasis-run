import debug from "debug";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
const log = debug("link");

debug.enable("link");
debug.enable("config");
export interface LinkOptions {
  root: string;
  oasisRoot?: string;
}

export async function link(options: LinkOptions) {
  log("current dir", options.root);
  log("oasis root", options.oasisRoot);

  const nodeModulePath = path.join(options.root, "node_modules");
  fs.ensureDirSync(nodeModulePath);
  const pkgs = getOasisPkgs(options.oasisRoot);
  removeTnpmLink(nodeModulePath, pkgs);
  const promises = pkgs.map((pkg) => {
    const destPath = path.join(nodeModulePath, pkg.pkgJson.name);
    fs.ensureDirSync(path.dirname(destPath));
    fs.removeSync(destPath);
    return fs.symlink(pkg.pkgPath, destPath).catch((e) => console.error(e));
  });
  await Promise.all(promises);

  console.log(chalk.green(`[SUCCESS] `) + "link 成功，请确保仓库没有 external o3");
  console.log(chalk.green(`[SUCCESS] `) + `进入 ${options.oasisRoot} 可以开启 watch`);
}

/**
 * 获取 Oasis Packages
 * @param oasisRoot
 */
function getOasisPkgs(oasisRoot: string) {
  let pkgJson: object | any;
  try {
    pkgJson = require(path.join(oasisRoot, "package.json"));
  } catch (e) {}
  if (!pkgJson || pkgJson.name !== "@alipay/o3-root") {
    throw `${chalk.redBright("[ERROR]")} 根路径设置错误: ${chalk.redBright(oasisRoot)}，使用 ${chalk.bgRed(
      "[oa link -c]"
    )} 设置 Oasis3D 开发 git 仓库根目录。`;
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

/**
 * 删除 tnpm link 文件
 * @param nodeModulePath
 * @param pkgs
 */
function removeTnpmLink(nodeModulePath: string, pkgs: { pkgPath: string; pkgJson: object | any }[]) {
  const deps = fs.readdirSync(nodeModulePath).filter((dep) => dep.startsWith("_@alipay_"));
  const checkDeps = pkgs.map(({ pkgJson }) => "_" + pkgJson.name.replace("/", "_"));
  const deleteDeps = deps.filter((dep) => {
    for (let i = 0; i < checkDeps.length; i++) {
      if (dep.startsWith(checkDeps[i])) {
        return true;
      }
    }
    return false;
  });
  deleteDeps.forEach((dep) => {
    fs.remove(path.join(nodeModulePath, dep));
  });
}


