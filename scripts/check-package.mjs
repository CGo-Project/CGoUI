#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const requiredFiles = [
    'LICENSE',
    'NOTICE',
    'README.md',
    'THIRD_PARTY_NOTICES.md',
    'CHANGELOG.md',
    'dist/cgo-ui.js',
    'dist/cgo-ui-react.js',
    'dist/theme.js',
    'styles/cgo_clr.css',
    'styles/cgo_element.css',
    'styles/cgo_ui.css',
    'styles/cgo_components.css',
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(ROOT, file)));
if (missing.length) throw new Error(`缺少发布文件：${missing.join(', ')}`);

const forbidden = ['../../../cgoui/', 'beian.miit.gov.cn', 'beian.mps.gov.cn', 'window.isViTool'];
const bundleText = readFileSync(resolve(ROOT, 'dist/cgo-ui.js'), 'utf8');
const leaked = forbidden.filter((needle) => bundleText.includes(needle));
if (leaked.length) throw new Error(`通用 bundle 仍包含宿主耦合内容：${leaked.join(', ')}`);

for (const [name, target] of Object.entries(packageJson.exports)) {
    const candidate = typeof target === 'string' ? target : target.import || target.default || target.types;
    if (candidate && candidate.startsWith('./') && !candidate.includes('*') && !existsSync(resolve(ROOT, candidate))) {
        throw new Error(`exports.${name} 指向不存在的文件：${candidate}`);
    }
}

// `npm pack --dry-run` 不需要复用依赖缓存；用一次性的临时 cache，避免宿主
// npm 缓存权限异常把普通开发者或 CI 卡在 root-owned 文件上。
const cacheDir = await mkdtemp(join(tmpdir(), 'cgo-ui-npm-cache-'));
let output;
try {
    output = execFileSync('npm', ['pack', '--dry-run', '--json', '--cache', cacheDir], {
        cwd: ROOT,
        encoding: 'utf8',
    });
} finally {
    await rm(cacheDir, { recursive: true, force: true });
}
const metadata = JSON.parse(output.trim()).at(-1);
const files = new Set((metadata?.files || []).map((file) => file.path));
for (const file of requiredFiles) {
    if (!files.has(file)) throw new Error(`npm pack 未包含：${file}`);
}

console.log(`[CGoUI Check] ${files.size} files will be published; package ${packageJson.version} is ready`);
