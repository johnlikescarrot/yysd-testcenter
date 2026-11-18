import { existsSync } from 'node:fs';
import packaged from '@sparticuz/chromium';
import { chromium } from 'playwright';

export async function chromeOptions() {
  // Use system fontconfig on Linux so that headless Chromium can embed Vietnamese glyphs.
  if (existsSync('/etc/fonts/fonts.conf')) process.env.FONTCONFIG_PATH ??= '/etc/fonts';
  packaged.setGraphicsMode = false;
  const executablePath = process.env.CHROME_PATH || await packaged.executablePath();
  return { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] };
}

export async function openBrowser() {
  return chromium.launch({ ...(await chromeOptions()), headless: true });
}
