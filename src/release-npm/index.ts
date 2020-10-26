import path from "path";
import fs from "fs-extra";
import { cloneDeep } from "lodash";
import { divideExec } from "../common/exec";

const moduleMapping = {
  "@alipay/o3": "oasis-engine",
  "@alipay/o3-core": "@oasis-engine/core",
  "@alipay/o3-math": "@oasis-engine/math",
  "@alipay/o3-design": "@oasis-engine/design",
  "@alipay/o3-rhi-webgl": "@oasis-engine/rhi-webgl",
  "@alipay/o3-loader": "@oasis-engine/loader",

  "@alipay/o3-engine-stats": "@oasis-engine/stats",
  "@alipay/o3-controls": "@oasis-engine/controls",
  "@alipay/o3-framebuffer-picker": "@oasis-engine/framebuffer-picker",
  "@alipay/o3-draco": "@oasis-engine/draco",
  "@alipay/o3-tween": "@oasis-engine/tween"

  // "@alipay/o3-post-processing": null,
  // "@alipay/o3-decal": null,
  // "@alipay/o3-renderer-oit": null,
  // "@alipay/o3-screenshot": null
};

interface ConvertPackage {
  root: string;
  pkg: any;
  targetName: string;
  targetPath?: string;
}

export function releaseNpm(version = "0.0.3", tag = "latest") {
  const packages = validate(moduleMapping);
  const root = "oasis-npm";
  copyToNew(root, packages);
  createAllPkgJSON(packages, version);
  divideExec(`npm`, ["publish", "--tag", tag, "--access=public"], path.join(process.cwd(), root));
}

function validate(modules: { [key: string]: string }) {
  const cwd = process.cwd();
  const rootPkgJsonPath = path.join(cwd, "package.json");
  if (!fs.existsSync(rootPkgJsonPath)) {
    throw new Error("请在 oasis3d 目录下执行命令");
  }
  try {
    const pkgJson = require(rootPkgJsonPath);
    if (pkgJson.name !== "@alipay/o3-root") {
      throw new Error("请在 oasis3d 目录下执行命令");
    }
  } catch (e) {
    throw new Error("请在 oasis3d 目录下执行命令");
  }

  const packagesRoot = path.join(cwd, "packages");
  const dirs = fs.readdirSync(packagesRoot);
  const validPackages = dirs.reduce<ConvertPackage[]>((validPackages, curr) => {
    const pkgJsonPath = path.join(packagesRoot, curr, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = require(pkgJsonPath);
      if (modules[pkgJson.name] != null) {
        validPackages.push({ root: path.join(packagesRoot, curr), pkg: pkgJson, targetName: modules[pkgJson.name] });
      }
    }
    return validPackages;
  }, []);

  const mainField = ["module", "main", "browser"];

  validPackages.forEach((item) => {
    const { dependencies = {} } = item.pkg;
    for (const dependency in dependencies) {
      if (modules[dependency] == null) {
        throw new Error(`${item.pkg.name} 找不到依赖包 ${dependency}`);
      }
    }
  });

  validPackages.forEach((item) => {
    for (let field of mainField) {
      if (item.pkg[field]) {
        const jsFilePath = path.join(item.root, item.pkg[field]);
        if (!fs.existsSync(jsFilePath)) {
          throw new Error(`缺少编译文件 ${item.pkg.name} ${item.pkg[field]}`);
        }
      }
    }
  });
  const typesField = ["types"];
  validPackages.forEach((item) => {
    for (let field of typesField) {
      if (item.pkg[field]) {
        const typeFiled = path.join(item.root, item.pkg[field]);
        if (!fs.existsSync(typeFiled)) {
          throw new Error(`缺少类型编译文件 ${item.pkg.name} ${item.pkg[field]}`);
        }
      }
    }
  });
  return validPackages;
}

function copyToNew(root: string, validPackages: ConvertPackage[] = []) {
  const cwd = process.cwd();
  fs.removeSync(path.join(cwd, root));
  fs.ensureDirSync(path.join(cwd, root));

  for (let item of validPackages) {
    const basename = path.basename(item.root);
    const pkgRoot = path.join(root, basename);
    fs.ensureDirSync(pkgRoot);
    const distRoot = path.join(item.root, "dist");
    const typesRoot = path.join(item.root, "types");

    readRootDir(distRoot)
      .map((filepath) => {
        return { code: readCode(filepath), filepath };
      })
      .forEach((item) => {
        const dest = path.join(path.join(pkgRoot, "dist"), path.basename(item.filepath));
        fs.ensureFileSync(dest);
        fs.writeFileSync(dest, replaceCodeImport(item.code), { encoding: "utf-8" });
      });

    readRootDir(typesRoot)
      .map((filepath) => {
        return { code: readCode(filepath), filepath };
      })
      .forEach((item) => {
        const dest = path.join(path.join(pkgRoot, "types"), path.basename(item.filepath));
        fs.ensureFileSync(dest);
        fs.writeFileSync(dest, replaceCodeImport(item.code), { encoding: "utf-8" });
      });

    // fs.copySync(distRoot, , { recursive: true });
    // fs.copySync(typesRoot, path.join(pkgRoot, "types"), { recursive: true });
    item.targetPath = pkgRoot;
  }
}

function createAllPkgJSON(packages: ConvertPackage[], version: string) {
  for (let item of packages) {
    createPackageJSON(item, version);
  }
}

function createPackageJSON(item: ConvertPackage, version: string) {
  const targetPkg = cloneDeep(item.pkg);
  targetPkg.name = item.targetName;
  targetPkg.version = version;
  const deletedFields = ["authors", "homepage", "repository", "bugs", "publishConfig", "keywords", "main", "module"];
  for (let field of deletedFields) {
    delete targetPkg[field];
  }
  targetPkg.dependencies = {};

  if (item.pkg.dependencies) {
    Object.keys(item.pkg.dependencies)
      .map((key) => moduleMapping[key])
      .forEach((key) => (targetPkg.dependencies[key] = version));
  }

  fs.writeJSONSync(path.join(item.targetPath, "package.json"), targetPkg, { encoding: "utf-8", spaces: 2 });
}

function readRootDir(root: string) {
  return fs
    .readdirSync(root)
    .map((file) => path.join(root, file))
    .filter((filepath) => fs.statSync(filepath).isFile());
}

function readCode(filePath: string) {
  return fs.readFileSync(filePath, { encoding: "utf-8" });
}

function replaceCodeImport(code) {
  const mapping = {
    "@alipay/o3-core": "@oasis-engine/core",
    "@alipay/o3-math": "@oasis-engine/math",
    "@alipay/o3-design": "@oasis-engine/design",
    "@alipay/o3-rhi-webgl": "@oasis-engine/rhi-webgl",
    "@alipay/o3-loader": "@oasis-engine/loader",

    "@alipay/o3-engine-stats": "@oasis-engine/stats",
    "@alipay/o3-controls": "@oasis-engine/controls",
    "@alipay/o3-framebuffer-picker": "@oasis-engine/framebuffer-picker",
    "@alipay/o3-draco": "@oasis-engine/draco",
    "@alipay/o3-tween": "@oasis-engine/tween",
    "@alipay/o3": "oasis-engine"
  };

  Object.keys(mapping).forEach((key) => {
    // console.log(`${key} to ${mapping[key]}`);
    code = replaceAll(code, key, mapping[key]);
  });
  return code;
}

function replaceAll(code, find, replacer) {
  return code.replace(find, replacer);
}
