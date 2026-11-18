import { build, publicFiles } from './site.mjs';

console.log(`Đã tập hợp ${publicFiles.length} tệp công khai tại ${await build()}.`);
