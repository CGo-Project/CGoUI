#!/usr/bin/env node
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_DIR = process.env.CGOUI_SITE_DIR
    ? resolve(process.env.CGOUI_SITE_DIR)
    : resolve(ROOT, 'site');

console.log('[CGoUI Site Build] 1. 正在编译核心 Bundle...');
execFileSync('node', ['scripts/build.mjs'], { cwd: ROOT, stdio: 'inherit' });

console.log(`[CGoUI Site Build] 2. 准备输出目录: ${SITE_DIR}`);
await rm(SITE_DIR, { recursive: true, force: true });
await mkdir(SITE_DIR, { recursive: true });

const staticFiles = [
    'index.html',
    'test_no_css.html',
    'cdn_demo.html',
    'design.png',
    'design2.png',
    'favicon.ico',
];

const staticDirs = [
    'dist',
    'styles',
    'docs',
    'i18n',
    'en',
    'ja',
    'ko',
    'zh-HK',
    'zh-TW',
    'examples',
];

console.log('[CGoUI Site Build] 3. 正在同步页面与资源...');
for (const file of staticFiles) {
    const src = resolve(ROOT, file);
    if (existsSync(src)) {
        await cp(src, resolve(SITE_DIR, file));
    }
}

for (const dir of staticDirs) {
    const src = resolve(ROOT, dir);
    if (existsSync(src)) {
        await cp(src, resolve(SITE_DIR, dir), { recursive: true });
    }
}

console.log(`[CGoUI Site Build] ✅ 静态展示站点构建完成！输出目录: ${SITE_DIR}`);
console.log('[CGoUI Site Build] 可直接将该目录部署至 Nginx / 静态托管服务，或使用 `npx serve site` 本地预览。');
