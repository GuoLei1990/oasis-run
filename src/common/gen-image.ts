import puppeteer from "puppeteer-core";
import path from "path";
interface GenOptions {
  images: string[];
  rule: string;
  out: string;
  chromePath: string;
}

export async function gen(options: GenOptions): Promise<Array<{ image: string; result: PromiseSettledResult<any> }>> {
  const chromeExec = path.join(options.chromePath, "Contents/MacOS/Google Chrome");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromeExec
  });

  const promises = options.images.map(async (image) => {
    const link = options.rule.replace("<name>", image);
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(link);
    await page.waitFor(1000);
    const imagePath = options.out.replace("<name>", image);
    await page.screenshot({
      path: imagePath
    });
  });

  const results = await Promise.allSettled(promises);

  await browser.close();
  return results.map((result, index) => {
    return {
      result,
      image: options.images[index]
    };
  });
}
