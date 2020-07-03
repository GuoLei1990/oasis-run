import fs from "fs";
import path from "path";
import { gen } from "../common";
export * from "./image-diff";
import { diffImageResult } from "./image-diff";

interface E2EOptions {
  expectedDir: string;
  rule: string;
}

export async function e2e(options: E2EOptions) {
  const expectedDir = options.expectedDir;
  const actualDir = path.join(path.dirname(expectedDir), "actual");
  const out = path.join(actualDir, "<name>.png");
  const images = getImageList(expectedDir);
  const results = await gen({
    images,
    out: out,
    rule: options.rule
  });

  results.forEach(({ result, image }) => {
    if (result.status === "fulfilled") {
      diffImageResult(expectedDir, actualDir, image);
    } else {
      console.error(result.reason);
      // result.reason
    }
  });
}

function getImageList(imageDir: string) {
  return fs.readdirSync(imageDir).map((image) => path.basename(image, ".png"));
}
