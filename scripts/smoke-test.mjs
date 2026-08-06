#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reactEntry = await import(resolve(ROOT, 'dist/cgo-ui-react.js'));
const themeEntry = await import(resolve(ROOT, 'dist/theme.js'));

if (!reactEntry.CgoButton || !reactEntry.CgoIcon || !reactEntry.buildSvg) {
    throw new Error('React bundle 缺少核心导出');
}
if (typeof themeEntry.applyTheme !== 'function' || typeof themeEntry.generateThemePalette !== 'function') {
    throw new Error('theme bundle 缺少核心导出');
}
const svg = reactEntry.buildSvg('check', { size: 16 });
if (!svg.includes('<svg') || !svg.includes('width="16px"')) {
    throw new Error('图标构建器烟囱测试失败');
}
const vanilla = readFileSync(resolve(ROOT, 'dist/cgo-ui.js'), 'utf8');
if (!vanilla.includes('customElements') || vanilla.length < 10000) {
    throw new Error('vanilla bundle 看起来不完整');
}
console.log('[CGoUI Smoke] React、theme、图标和 vanilla bundle 检查通过');
