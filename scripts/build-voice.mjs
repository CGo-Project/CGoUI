#!/usr/bin/env node
import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WATCH = process.argv.includes('--watch');
const NO_VERSION = process.argv.includes('--no-version');

// 解析 CGo-Voice 目标路径
function resolveVoiceDir() {
    // 1. 命令行参数 --target <path>
    const targetIdx = process.argv.indexOf('--target');
    if (targetIdx !== -1 && process.argv[targetIdx + 1]) {
        return resolve(process.argv[targetIdx + 1]);
    }
    // 2. 环境变量 CGO_VOICE_DIR
    if (process.env.CGO_VOICE_DIR) {
        return resolve(process.env.CGO_VOICE_DIR);
    }
    // 3. 默认同级目录 ../CGo-Voice
    const defaultVoice = resolve(ROOT, '../CGo-Voice');
    if (existsSync(defaultVoice)) {
        return defaultVoice;
    }
    // 4. 备选已知固定路径
    const fixedVoice = '/Users/liuzihan/Documents/GitHub/CGo-Voice';
    if (existsSync(fixedVoice)) {
        return fixedVoice;
    }
    return defaultVoice;
}

const VOICE_DIR = resolveVoiceDir();
const VOICE_STATIC_DIR = resolve(VOICE_DIR, 'static');
const VOICE_CGOUI_DIR = resolve(VOICE_STATIC_DIR, 'cgoui');

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

async function runBuildAndSync() {
    if (!existsSync(VOICE_DIR)) {
        console.error(`[CGoUI Voice Build] ❌ 错误: 未找到 CGo-Voice 项目目录: ${VOICE_DIR}`);
        console.error('[CGoUI Voice Build] 请通过 CGO_VOICE_DIR 环境变量或 --target 参数指定有效路径。');
        process.exit(1);
    }

    console.log(`[CGoUI Voice Build] 🎯 目标项目路径: ${VOICE_DIR}`);
    console.log('[CGoUI Voice Build] 1. 正在编译核心 Bundle...');
    execFileSync('node', ['scripts/build.mjs'], { cwd: ROOT, stdio: 'inherit' });

    console.log(`[CGoUI Voice Build] 2. 准备输出目录: ${VOICE_CGOUI_DIR}`);
    await mkdir(VOICE_CGOUI_DIR, { recursive: true });

    // 需要同步到 CGo-Voice 的资源清单
    const syncItems = [
        // 编译产物
        { src: resolve(ROOT, 'dist/cgo-ui.js'), dest: resolve(VOICE_CGOUI_DIR, 'cgo-ui.js') },
        { src: resolve(ROOT, 'dist/cgo-ui-react.js'), dest: resolve(VOICE_CGOUI_DIR, 'cgo-ui-react.js') },
        { src: resolve(ROOT, 'dist/theme.js'), dest: resolve(VOICE_CGOUI_DIR, 'theme.js') },
        // 样式文件
        { src: resolve(ROOT, 'styles/cgo_clr.css'), dest: resolve(VOICE_CGOUI_DIR, 'cgo_clr.css') },
        { src: resolve(ROOT, 'styles/cgo_element.css'), dest: resolve(VOICE_CGOUI_DIR, 'cgo_element.css') },
        { src: resolve(ROOT, 'styles/cgo_ui.css'), dest: resolve(VOICE_CGOUI_DIR, 'cgo_ui.css') },
        { src: resolve(ROOT, 'styles/cgo_components.css'), dest: resolve(VOICE_CGOUI_DIR, 'cgo_components.css') },
    ];

    console.log('[CGoUI Voice Build] 3. 正在同步 JS 与 CSS 产物...');
    for (const item of syncItems) {
        if (existsSync(item.src)) {
            await cp(item.src, item.dest);
            const fileStat = await stat(item.dest);
            console.log(`  -> 拷贝 ${item.dest.slice(VOICE_DIR.length + 1)} (${Math.round(fileStat.size / 1024)} KB)`);
        } else {
            console.warn(`  ⚠️ 源文件未找到: ${item.src}`);
        }
    }

    // 版本号更新（防止浏览器强缓存）
    let versionQuery = '';
    if (!NO_VERSION) {
        versionQuery = process.env.CGOUI_VERSION || getTimestampVersion();
        console.log(`[CGoUI Voice Build] 4. 正在刷新 CGo-Voice 页面版本参数 (?v=${versionQuery})...`);
        const targetPages = [
            resolve(VOICE_STATIC_DIR, 'index.html'),
            resolve(VOICE_STATIC_DIR, 'readme.html'),
            resolve(VOICE_STATIC_DIR, 'privacy.html'),
        ];

        for (const pagePath of targetPages) {
            if (existsSync(pagePath)) {
                const content = await readFile(pagePath, 'utf8');
                // 替换各类 ./cgoui/xxx.(css|js)?v=...
                const updated = content.replace(
                    /((?:\.\/)?cgoui\/[a-zA-Z0-9_\-]+\.(?:css|js)\?v=)[0-9.]+/g,
                    `$1${versionQuery}`
                );
                if (updated !== content) {
                    await writeFile(pagePath, updated, 'utf8');
                    console.log(`  -> 已更新版本号: ${pagePath.slice(VOICE_DIR.length + 1)}`);
                }
            }
        }
    }

    console.log(`[CGoUI Voice Build] ✅ 成功！已将最新 CGoUI 产物同步到 CGo-Voice (${VOICE_CGOUI_DIR})` + (versionQuery ? ` [版本: ?v=${versionQuery}]` : ''));
}

await runBuildAndSync();

if (WATCH) {
    console.log('\n[CGoUI Voice Build] 👁️  正在监听 src/ 与 styles/ 变更，改动将自动重新构建并同步...');
    let debounceTimer = null;
    const triggerRebuild = (eventType, filename) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            console.log(`\n[CGoUI Voice Build] 🔔 检测到文件变更 (${filename || eventType})，正在重新构建并同步...`);
            try {
                await runBuildAndSync();
            } catch (err) {
                console.error('[CGoUI Voice Build] ❌ 构建失败:', err);
            }
        }, 300);
    };

    const watchDirs = [resolve(ROOT, 'src'), resolve(ROOT, 'styles')];
    for (const dir of watchDirs) {
        if (existsSync(dir)) {
            watch(dir, { recursive: true }, triggerRebuild);
        }
    }

    process.stdin.resume();
    process.on('SIGINT', () => {
        console.log('\n[CGoUI Voice Build] 退出监听模式。');
        process.exit(0);
    });
}
