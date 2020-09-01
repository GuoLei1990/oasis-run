import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import fs from "fs-extra";
import path from "path";
interface E2EScreenShootResult {
  image: string;
  expectedImage: string;
  actualImage: string;
  diffImage: string;
  similarityRate: number;
}

interface E2EErrorResult {
  image: string;
  expectedImage: string;
  errorMsg: string;
}

type E2EResult = E2EErrorResult | E2EScreenShootResult;

/**
 * 比较两个图片
 * @param expectedDir 期望图片的文件夹
 * @param actualDir 实际图片的文件夹
 * @param diffDir diff 图片路径
 * @param image 图片名
 */
export function diffImageResult(
  expectedDir: string,
  actualDir: string,
  diffDir: string,
  image: string
): E2EScreenShootResult {
  const expectedImagePath = path.join(expectedDir, `${image}.png`);
  const actualImagePath = path.join(actualDir, `${image}.png`);
  const diffImagePath = path.join(diffDir, `${image}.png`);

  const img1 = PNG.sync.read(fs.readFileSync(expectedImagePath));
  const img2 = PNG.sync.read(fs.readFileSync(expectedImagePath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

  fs.writeFileSync(diffImagePath, PNG.sync.write(diff));
  
  return {
    image,
    expectedImage: expectedImagePath,
    actualImage: actualImagePath,
    diffImage: diffImagePath,
    similarityRate: numDiffPixels / (width * height)
  };
}
