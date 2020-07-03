import { chromium } from "playwright";

interface GenOptions {
  images: string[];
  rule: string;
  out: string;
}

export async function gen(options: GenOptions): Promise<Array<{ image: string; result: PromiseSettledResult<any> }>> {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();

  const promises = options.images.map(async (image) => {
    const link = options.rule.replace("<name>", image);
    const page = await context.newPage();
    await page.goto(link);
    await page.waitForTimeout(1000);
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
