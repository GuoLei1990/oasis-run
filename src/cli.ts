#!/usr/bin/env node

import { prepareLink } from "./link/cli-prepare";

const cli = require("cac")();
const pkg = require("../package.json");
const path = require("path");
const defaultDir = ".dragaux";
const defaultConfigFile = "config.js";
const { e2e, gen, link } = require("../dist");

cli
  .command("e2e")
  .option("-r, --rule", "access rule")
  .action((files, options) => {
    const config = require(path.join(process.env.PWD, defaultDir, defaultConfigFile));
    const finalOptions = { expectedDir: path.join(process.env.PWD, defaultDir, "expected"), ...config };
    e2e(finalOptions);
  });
cli
  .command("gen")
  .option("-r, --rule", "access rule")
  .action(async (files, options) => {
    const config = require(path.join(process.env.PWD, defaultDir, defaultConfigFile));
    config.out = path.join(process.env.PWD, defaultDir, "expected", "<name>.png");
    const finalOptions = { expectedDir: path.join(process.env.PWD, defaultDir, "results"), ...config };
    gen(finalOptions).then((results) => {
      results.forEach(({ result, image }) => {
        const re = /([\s\S]+)====================== page\.goto logs ======================/;
        if (result.status !== "fulfilled") {
          const logMsg = result.reason.message.match(re)[1];
          console.log(image);
          console.error(logMsg);
        }
      });
    });
  });
cli
  .command("link [oasis-dir]", "link oasis root repo")
  .option("-c, --clear", "clear oasis root")
  .action((dir: string, options: { clear: undefined | boolean }) => {
    prepareLink(dir, options.clear)
      .then((oasisRoot) => link({ root: process.env.PWD, oasisRoot }))
      .catch((e: Error) => {
        console.error(e);
      });
  });
// Display help message when `-h` or `--help` appears
cli.help();
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version(pkg.version);
cli.parse();
