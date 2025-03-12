import puppeteer from "puppeteer";

export const takeScreenshot = async (url, outputPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 1146, height: 644 });
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
};
