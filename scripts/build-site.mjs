#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

function getTimestampVersion() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yy}${mm}${dd}.${hh}${min}${ss}`;
}

const versionQuery = process.env.CGOUI_VERSION || getTimestampVersion();
console.log(`[CGoUI Site Build] 4. 正在注入版本号查询参数 ?v=${versionQuery}...`);
for (const targetFile of [resolve(ROOT, 'index.html'), resolve(SITE_DIR, 'index.html')]) {
    if (existsSync(targetFile)) {
        const content = await readFile(targetFile, 'utf8');
        const updated = content.replace(/((\.\/)?dist\/cgo-ui\.js\?v=)[0-9.]+/g, `$1${versionQuery}`);
        if (updated !== content) {
            await writeFile(targetFile, updated, 'utf8');
        }
    }
}

console.log(`[CGoUI Site Build] ✅ 静态展示站点构建完成！输出目录: ${SITE_DIR} (版本: ?v=${versionQuery})`);
console.log('[CGoUI Site Build] 可直接将该目录部署至 Nginx / 静态托管服务，或使用 `npx serve site` 本地预览。');
