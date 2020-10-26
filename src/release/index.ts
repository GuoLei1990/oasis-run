import path from "path";
import inquirer from "inquirer";
import { divideExec } from "../common/exec";

export async function release() {
  const cwd = process.cwd();

  const version = require(path.join(cwd, "node_modules", "@lerna", "version"));
  const tag = await queryTag();
  await version({ forcePublish: true, exact: true });
  const basePackagePath = path.join(cwd, "packages");
  divideExec(`tnpm`, ["publish", "--tag", tag], basePackagePath);
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
