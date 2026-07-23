#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const input = await readFile('examples/wan-status-sample.txt', 'utf8');
const result = spawnSync(process.execPath, ['tools/parse-wan-status.mjs'], {
  input,
  encoding: 'utf8'
});

if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}

const parsed = JSON.parse(result.stdout);
const required = ['band', 'pccEarfcn', 'pci', 'scc', 'sinrAvgDb', 'rsrqAvgDb'];
for (const key of required) {
  if (!(key in parsed)) throw new Error(`Missing ${key}`);
}
console.log('Smoke test passed.');
