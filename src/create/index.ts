import { fork } from "child_process";
import path from "path";
import chalk from "chalk";
import { monitor } from "../common/monitor";

export function create() {
  console.log(chalk.greenBright("🚛 开始创建 Oasis 模块"));
  monitor.logCreatePV();
  const extDir = path.join(__dirname, "../..", "oasis-ext-template");
  const mafBinPath = path.join(__dirname, "../..", "./node_modules/@alipay/maf/bin/cli.js");

  fork(mafBinPath, ["create", extDir]);
}
