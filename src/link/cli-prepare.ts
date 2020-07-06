import { getConfig, writeConfig } from "../common";
import inquirer from "inquirer";

// import debug from "debug";

// debug.enable("link");

const oasisRootKey = "oasisRoot";

export async function prepareLink(oasisRoot: string, clear: boolean): Promise<string> {
  oasisRoot = await getOasisRoot(oasisRoot, clear);
  writeConfig(oasisRootKey, oasisRoot);
  return oasisRoot;
}

async function getOasisRoot(oasisRoot: string, clear: boolean): Promise<string> {
  if (oasisRoot) {
    return oasisRoot;
  }

  if (clear) {
    return await queryOasisRoot();
  }

  return getConfig(oasisRootKey);
}

async function queryOasisRoot() {
  const result = await inquirer.prompt([
    {
      name: "oasisRoot",
      message: "输入 Oasis3D 仓库根目录(oasis3d 目录而不是 packages/o3):"
    }
  ]);
  return result.oasisRoot;
}
