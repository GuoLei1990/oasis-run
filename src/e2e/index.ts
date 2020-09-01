import fs from "fs";
import path from "path";
import { gen } from "../common";
export * from "./image-diff";
import { diffImageResult } from "./image-diff";
import { getChromePath } from "./find-chrome";
import chalk from "chalk";

interface E2EOptions {
  expectedDir: string;
  rule: string;
  chromePath?: string;
}

export async function e2e(options: E2EOptions) {
  const chromePath = options.chromePath ?? (await getChromePath());
  if (!chromePath) {
    console.error(chalk.redBright(`⚠️ 没有找到 Chrome 安装位置，请手动指定！`));
    return;
  }
  const expectedDir = options.expectedDir;
  const imageDir = path.dirname(expectedDir);
  const actualDir = path.join(imageDir, "actual");
  const diffDir = path.join(imageDir, "diff");
  const out = path.join(actualDir, "<name>.png");
  const images = getImageList(expectedDir);
  const results = await gen({
    images,
    out: out,
    rule: options.rule,
    chromePath: chromePath
  });

  results.forEach(({ result, image }) => {
    if (result.status === "fulfilled") {
      diffImageResult(expectedDir, actualDir, diffDir, image);
    } else {
      console.error(result.reason);
      // result.reason
    }
  });
}

function getImageList(imageDir: string) {
  return fs.readdirSync(imageDir).map((image) => path.basename(image, ".png"));
}
