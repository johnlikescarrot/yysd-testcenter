import packagedChromium from '@sparticuz/chromium';
import { chromium } from 'playwright-core';

export const executablePath = () => process.env.CHROME_PATH || packagedChromium.executablePath();
export const openBrowser = async () => chromium.launch({ executablePath: await executablePath(), args: ['--disable-gpu'] });
