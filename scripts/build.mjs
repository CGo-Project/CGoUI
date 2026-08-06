#!/usr/bin/env node
import { build } from 'vite';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const WATCH = process.argv.includes('--watch');

const entries = [
    {
        input: resolve(ROOT, 'src/register.js'),
        fileName: 'cgo-ui.js',
        external: [],
    },
    {
        input: resolve(ROOT, 'src/react.js'),
        fileName: 'cgo-ui-react.js',
        external: [/^react(?:\/|$)/, /^react-dom(?:\/|$)/, /^@lit\/react(?:\/|$)/, /^lit(?:\/|$)/],
    },
    {
        input: resolve(ROOT, 'src/theme-entry.js'),
        fileName: 'theme.js',
        external: [],
    },
];

await mkdir(DIST, { recursive: true });
if (!WATCH) await rm(DIST, { recursive: true, force: true });

const watchers = [];
for (const [index, entry] of entries.entries()) {
    const watcher = await build({
        configFile: false,
        root: ROOT,
        logLevel: 'info',
        build: {
            emptyOutDir: false,
            watch: WATCH ? {} : null,
            rollupOptions: {
                input: entry.input,
                external: entry.external,
                preserveEntrySignatures: 'strict',
                output: {
                    format: 'es',
                    exports: 'named',
                    entryFileNames: entry.fileName,
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    assetFileNames: 'assets/[name][extname]',
                },
            },
        },
    });
    if (WATCH && watcher && typeof watcher.on === 'function') {
        watcher.on('event', (event) => {
            if (event.code === 'ERROR') console.error(`[CGoUI Build] ${entry.fileName}:`, event.error);
        });
        watchers.push(watcher);
    }
    if (index === entries.length - 1) {
        console.log(`[CGoUI Build] ${WATCH ? 'watching' : 'built'} ${entries.length} entrypoints in ${DIST}`);
    }
}

if (WATCH) {
    process.stdin.resume();
    process.on('SIGINT', async () => {
        await Promise.all(watchers.map((watcher) => watcher.close()));
        process.exit(0);
    });
}
