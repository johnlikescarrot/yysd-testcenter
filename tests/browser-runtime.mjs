/** Use the npm-packaged Chromium, including its bundled Linux NSS libraries. */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

process.env.AWS_LAMBDA_JS_RUNTIME ||= 'nodejs22.x';
const { default: chromium, inflate } = await import('@sparticuz/chromium');
// The executable may already be cached even when the matching libraries are not.
if (!existsSync('/tmp/al2023/lib/libnspr4.so')) {
  await inflate(resolve('node_modules/@sparticuz/chromium/bin/al2023.tar.br'));
}
export const executablePath = await chromium.executablePath();
export const browserArgs = ['--no-sandbox', '--no-zygote', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
