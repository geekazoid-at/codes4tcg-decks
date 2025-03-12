import puppeteer from "puppeteer";

export const takeScreenshot = async (url, outputPath) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 1146, height: 644 });
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
};
