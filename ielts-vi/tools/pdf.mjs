// Print the same accessible HTML that a learner can read without a PDF viewer.
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  for (const name of ["cam-nang", "so-thuc-hanh"]) {
    const page = await browser.newPage();
    await page.goto(new URL(`../${name}.html`, import.meta.url).href);
    await page.pdf({
      path: fileURLToPath(new URL(`../assets/${name}.pdf`, import.meta.url)),
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
    });
    await page.close();
  }
} finally {
  await browser.close();
}
