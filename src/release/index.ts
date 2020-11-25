import path from "path";
import fs from "fs-extra";
import inquirer from "inquirer";
import { divideExec } from "../common/exec";

// "publishConfig": {
//   "registry": "http://registry.npm.alibaba-inc.com"
// },
function isInnerNpm(dir: string) {
  const pkg = require(path.join(dir, `package.json`));
  return (
    pkg.publishConfig?.registry === "http://registry.npm.alibaba-inc.com" ||
    pkg.publishConfig?.registry === "https://registry.npm.alibaba-inc.com"
  );
}

function checkBaseInnerNpm(dir: string) {
  const packagePathes = fs
    .readdirSync(dir)
    .map((p: string) => path.join(dir, p))
    .filter((p: string) => fs.statSync(p).isDirectory())
    .filter((p: string) => fs.existsSync(path.join(p, "package.json")));

  return isInnerNpm(packagePathes[0]);
}

export async function release() {
  const cwd = process.cwd();

  const version = require(path.join(cwd, "node_modules", "@lerna", "version"));
  const tag = await queryTag();
  await version({ forcePublish: true, exact: true });
  const basePackagePath = path.join(cwd, "packages");
  const isInnerNpm = checkBaseInnerNpm(basePackagePath);
  divideExec(isInnerNpm ? `tnpm` : `npm`, ["publish", "--tag", tag], basePackagePath);
}

async function queryTag() {
  const { tag, customTag } = await inquirer.prompt([
    {
      name: "tag",
      type: "list",
      choices: ["latest", "alpha", "beta", "Custom Tag"],
      message: "选择发布的 tag"
    },
    {
      name: "customTag",
      message: "请输入自定义的 tag",
      when: ({ tag }) => {
        return tag === "Custom Tag";
      },
      default: "latest"
    }
  ]);
  return customTag ?? tag;
}
