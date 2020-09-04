const path = require("path");
const fs = require("fs");
const execa = require("execa");
const os = require("os");

const CWD = process.cwd();
const CPU_LEN = os.cpus().length;

const basePackagePath = path.join(CWD, "packages");
const packagePathes = fs
  .readdirSync(basePackagePath)
  .map((p) => path.join(basePackagePath, p))
  .filter((p) => fs.statSync(p).isDirectory())
  .filter((p) => fs.existsSync(path.join(p, "package.json")));

async function execCMD(cmdText: string, options: string[], cwd: string) {
  console.log(`exec ${cmdText} in ${cwd}`);
  let output;
  try {
    const { stdout } = await execa(cmdText, options, { cwd });
    output = stdout;
    console.log(`finish exec ${cmdText} in ${cwd}: ${output}`);
  } catch (e) {
    console.log(e);
  }
}

const dividedPathes = [];

while (packagePathes.length > 0) {
  dividedPathes.push(packagePathes.splice(0, CPU_LEN));
}

export async function divideExec(cmd: string, options: string[]) {
  for (let i = 0; i < dividedPathes.length; i++) {
    const itemPathes = dividedPathes[i];
    const promises = itemPathes.map((p) => execCMD(cmd, options, p));
    await Promise.all(promises);
  }
}
