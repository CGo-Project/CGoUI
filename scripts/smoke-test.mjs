#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseDeclaredExports(dtsText) {
    const names = new Set();
    for (const match of dtsText.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_$]+)/g)) {
        names.add(match[1]);
    }
    for (const match of dtsText.matchAll(/export\s+\*\s+as\s+([A-Za-z0-9_$]+)\s+from/g)) {
        names.add(match[1]);
    }
    return [...names];
}

function parseBundledExports(bundleText) {
    const names = new Set();
    for (const match of bundleText.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
        for (const item of match[1].split(',')) {
            const parts = item.trim().split(/\s+as\s+/);
            const exportedName = (parts[1] || parts[0] || '').trim();
            if (exportedName) names.add(exportedName);
        }
    }
    return names;
}

// 1. Import theme & react entrypoints in pure Node without DOM shims, and verify dist/cgo-ui.js exports
const themeEntry = await import(resolve(ROOT, 'dist/theme.js'));
const reactEntry = await import(resolve(ROOT, 'dist/cgo-ui-react.js'));
const vanillaBundle = readFileSync(resolve(ROOT, 'dist/cgo-ui.js'), 'utf8');
const vanillaExports = parseBundledExports(vanillaBundle);

for (const name of parseDeclaredExports(readFileSync(resolve(ROOT, 'src/theme.d.ts'), 'utf8'))) {
    assert.equal(typeof themeEntry[name], 'function', `dist/theme.js 缺少函数导出: ${name}`);
}
for (const name of parseDeclaredExports(readFileSync(resolve(ROOT, 'src/react.d.ts'), 'utf8'))) {
    assert.ok(name in reactEntry, `dist/cgo-ui-react.js 缺少 react.d.ts 声明的导出: ${name}`);
}
for (const name of parseDeclaredExports(readFileSync(resolve(ROOT, 'src/index.d.ts'), 'utf8'))) {
    assert.ok(vanillaExports.has(name), `dist/cgo-ui.js 缺少 index.d.ts 声明的导出: ${name}`);
}

// 2. Theme engine defaults, color math, sanitization & SSR safety
assert.equal(themeEntry.getHeaderMode(), 'floating', '默认顶栏模式应当为 floating');
assert.equal(themeEntry.getGlassMode(), 'liquid', '默认玻璃模式应当为 liquid');
assert.equal(themeEntry.getBgMode(), 'solid', '默认背景模式应当为 solid');
assert.deepEqual(themeEntry.hexToRgb('#006098'), [0, 96, 152]);
assert.deepEqual(themeEntry.hexToRgb('#123'), [17, 34, 51]);
assert.equal(themeEntry.hexToRgb('#1234'), null);
assert.equal(themeEntry.hexToRgb('#gggggg'), null);
assert.equal(themeEntry.hexToRgb(null), null);

const nanHex = themeEntry.hslToHex(Number.NaN, 50, 50);
assert.match(nanHex, /^#[0-9a-f]{6}$/i, `hslToHex NaN 应返回安全 hex: ${nanHex}`);

const palette = themeEntry.generateThemePalette('#00263b');
assert.ok(palette && /^#[0-9a-f]{6}$/i.test(palette.primary));
assert.equal(themeEntry.generateThemePalette('invalid'), null);

const applied = themeEntry.setThemeColor('#10b981', {
    primary: 'red; } body{background:red',
    darkPrimary: '#34d399',
});
assert.ok(applied && applied.darkPrimary === '#34d399');
assert.notEqual(applied.primary, 'red; } body{background:red');
themeEntry.applyTheme('invalid-theme-should-not-throw');

// 3. Icon builder: frozen registry, prototype guard, attribute escaping & unique brand gradient IDs
assert.equal(Object.isFrozen(reactEntry.ICONS), true, 'ICONS 应当被 Object.freeze 冻结');
assert.equal(reactEntry.buildSvg('__proto__'), '');
assert.equal(reactEntry.buildSvg('constructor'), '');
assert.equal(reactEntry.buildSvg('toString'), '');

const checkSvg = reactEntry.buildSvg('check', { size: 16 });
assert.ok(checkSvg.includes('<svg') && checkSvg.includes('width="16px"'));

const xssSvg = reactEntry.buildSvg('check', {
    class: '" onclick="alert(1)',
    size: "16'<>",
    color: 'red" onload="x',
});
assert.ok(!xssSvg.includes('" onclick='), 'buildSvg 必须转义 class 属性引号');
assert.ok(!xssSvg.includes('" onload='), 'buildSvg 必须转义 color 属性引号');

const g1 = reactEntry.buildSvg('addone', { colorMode: 'brand' });
const g2 = reactEntry.buildSvg('addone', { colorMode: 'brand' });
const id1 = g1.match(/id="(cgo-brand-grad-\d+)"/)?.[1];
const id2 = g2.match(/id="(cgo-brand-grad-\d+)"/)?.[1];
assert.ok(id1 && id2 && id1 !== id2, '连续生成的品牌渐变 ID 必须唯一');
assert.ok(reactEntry.buildSvg('bell', { colorMode: 'brand' }).includes('cgo-brand-grad-'), 'bell 应支持品牌渐变');

assert.ok(vanillaBundle.includes('customElements') && vanillaBundle.length >= 10000);

// 4. Static hygiene: Shadow DOM portability, no unsafeHTML, no host leaks
const compDir = resolve(ROOT, 'src/components');
for (const file of readdirSync(compDir)) {
    if (!file.endsWith('.js')) continue;
    const text = readFileSync(join(compDir, file), 'utf8');
    assert.ok(!text.includes(':host-context('), `${file} 仍包含 :host-context(`);
    assert.ok(!text.includes('unsafeHTML('), `${file} 仍包含 unsafeHTML(`);
}
const spinnerSrc = readFileSync(join(compDir, 'spinner.js'), 'utf8');
assert.ok(!spinnerSrc.includes('v <= 1) v = v * 100'), 'spinner.js 不得把 value=1 误乘为 100%');

function walkFiles(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', 'dist', 'site', '.npm-cache'].includes(entry.name)) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walkFiles(full, out);
        else out.push(full);
    }
    return out;
}

const checkRoots = ['src', 'styles', 'scripts', 'docs', 'i18n', 'templates', 'examples', '.github'];
const forbiddenGlobal = ['/Users/', 'beian.miit.gov.cn', 'beian.mps.gov.cn', '/dist/styles/', '/all-emil', 'bjsubway'];
for (const sub of checkRoots) {
    const base = resolve(ROOT, sub);
    if (!existsSync(base)) continue;
    for (const file of walkFiles(base)) {
        if (!/\.(js|mjs|ts|css|html|md|json|yml|yaml|sh)$/i.test(file)) continue;
        // smoke-test.mjs 与 check-package.mjs 自身包含上述禁用串作为负向校验常量
        if (file === resolve(ROOT, 'scripts/smoke-test.mjs') || file === resolve(ROOT, 'scripts/check-package.mjs')) continue;
        const text = readFileSync(file, 'utf8');
        for (const needle of forbiddenGlobal) {
            assert.ok(!text.includes(needle), `${file} 仍包含禁用文本: ${needle}`);
        }
    }
}

// 5. i18n locales & localized wrappers parity + docs.js icon validation
for (const loc of ['en', 'ja', 'ko', 'zh-HK', 'zh-TW']) {
    const dictPath = resolve(ROOT, `i18n/locales/${loc}.json`);
    assert.ok(existsSync(dictPath), `缺少语言包: ${dictPath}`);
    const parsed = JSON.parse(readFileSync(dictPath, 'utf8'));
    assert.ok(Object.keys(parsed).length >= 1000, `${loc}.json 条目过少`);
    if (loc === 'zh-HK' || loc === 'zh-TW') {
        for (const val of Object.values(parsed)) {
            assert.ok(!String(val).includes('向け'), `${loc}.json 包含日语词汇 '向け'`);
        }
    }
    for (const rel of ['index.html', 'cdn_demo.html', 'test_no_css.html', 'examples/metro-demo/index.html']) {
        assert.ok(existsSync(resolve(ROOT, loc, rel)), `缺少本地化入口: ${loc}/${rel}`);
    }
}

const docsJsText = readFileSync(resolve(ROOT, 'docs/docs.js'), 'utf8');
for (const match of docsJsText.matchAll(/(?:<cgo-icon\b[^>]*\bname=|icon:\s*['"]|<cgo-button\b[^>]*\bicon=)['"]?([a-z0-9-]+)['"]/gi)) {
    const iconName = match[1];
    if (['left', 'right', 'sm', 'lg', 'xl'].includes(iconName)) continue;
    assert.ok(Object.hasOwn(reactEntry.ICONS, iconName), `docs/docs.js 引用了不存在的图标名: ${iconName}`);
}

console.log('[CGoUI Smoke] Export parity, theme, icons, hygiene, i18n, and docs checks passed');
