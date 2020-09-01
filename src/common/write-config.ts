import fs = require("fs-extra");
import path = require("path");
import os from "os";
import debug from "debug";
const defaultConfigPath = path.join(os.homedir(), ".oasis/conf.json");
const log = debug("config");

let cache: any | object;

export function writeConfig(key: string, value: string) {
  const config = readFileConfig();
  config[key] = value;
  log("write config", config);
  fs.writeJsonSync(defaultConfigPath, config, { encoding: "utf-8" });
}

export function getConfig(key: string) {
  const config = readFileConfig();
  return config[key];
}

function readFileConfig() {
  if (!cache) {
    fs.ensureFileSync(defaultConfigPath);
    const content = fs.readFileSync(defaultConfigPath, { encoding: "utf-8" });
    try {
      cache = JSON.parse(content);
    } catch (e) {
      cache = {};
    }
  }
  return cache;
}
