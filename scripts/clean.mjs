#!/usr/bin/env node
import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await rm(resolve(ROOT, 'dist'), { recursive: true, force: true });
console.log('[CGoUI Clean] dist removed');
