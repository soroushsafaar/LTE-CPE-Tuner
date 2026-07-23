#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const FIELD_MAP = {
  rsrpRaw: 9,
  rssiRaw: 10,
  pccEarfcn: 14,
  ulEarfcn: 15,
  attach: 16,
  sim: 17,
  signalBars: 18,
  pci: 32,
  rsrqRaw: 35,
  transmissionMode: 49,
  dlModulation: 51,
  ulModulation: 52,
  band: 53,
  cellId: 54,
  scc: 55,
  currentUpload: 56,
  currentDownload: 57,
  ip: 62,
  operator: 66,
  sinrRaw: 67
};

function extractBlock(text, name) {
  const re = new RegExp('\\{' + name + '::([\\s\\S]*?)\\}');
  return text.match(re)?.[1] || '';
}

function toNumberList(value, scale = 100, ignoreZero = false) {
  if (value == null || value === '') return [];
  return String(value)
    .split(',')
    .map(x => Number(String(x).trim()))
    .filter(Number.isFinite)
    .filter(x => (ignoreZero ? x !== 0 : true))
    .map(x => x / scale);
}

function avg(values, digits = 2) {
  if (!values.length) return null;
  const n = values.reduce((a, b) => a + b, 0) / values.length;
  return Number(n.toFixed(digits));
}

function max(values, digits = 2) {
  if (!values.length) return null;
  return Number(Math.max(...values).toFixed(digits));
}

function parseRateMbps(value) {
  if (!value) return null;
  const s = String(value).trim().toLowerCase();
  const m = s.match(/([0-9]+(?:\.[0-9]+)?)\s*([kmgt]?bps)/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (!Number.isFinite(n)) return null;
  if (unit === 'kbps') return Number((n / 1000).toFixed(3));
  if (unit === 'mbps') return n;
  if (unit === 'gbps') return n * 1000;
  return n;
}

function parseWanStatus(rawText) {
  const main = extractBlock(rawText, 'ue_state_info');
  const sccRaw = extractBlock(rawText, 'ue_scc_info');
  const freqDlRaw = extractBlock(rawText, 'ue_freqDl_info');
  const a = main.split(';');

  const rsrpList = toNumberList(a[FIELD_MAP.rsrpRaw], 100, false);
  const rssiList = toNumberList(a[FIELD_MAP.rssiRaw], 100, false);
  const rsrqList = toNumberList(a[FIELD_MAP.rsrqRaw], 100, false);
  const sinrList = toNumberList(a[FIELD_MAP.sinrRaw], 100, true);

  return {
    attach: a[FIELD_MAP.attach] || '',
    sim: a[FIELD_MAP.sim] || '',
    signalBars: a[FIELD_MAP.signalBars] || '',
    band: a[FIELD_MAP.band] || '',
    pccEarfcn: a[FIELD_MAP.pccEarfcn] || '',
    ulEarfcn: a[FIELD_MAP.ulEarfcn] || '',
    pci: a[FIELD_MAP.pci] || '',
    cellId: a[FIELD_MAP.cellId] || '',
    transmissionMode: a[FIELD_MAP.transmissionMode] || '',
    dlModulation: a[FIELD_MAP.dlModulation] || '',
    ulModulation: a[FIELD_MAP.ulModulation] || '',
    scc: a[FIELD_MAP.scc] || '',
    sccRaw,
    freqDlRaw,
    rsrpAvgDbm: avg(rsrpList),
    rssiAvgDbm: avg(rssiList),
    rsrqAvgDb: avg(rsrqList),
    rsrqBestDb: max(rsrqList),
    sinrAvgDb: avg(sinrList),
    sinrBestDb: max(sinrList),
    currentDownload: a[FIELD_MAP.currentDownload] || '',
    currentUpload: a[FIELD_MAP.currentUpload] || '',
    currentDownloadMbps: parseRateMbps(a[FIELD_MAP.currentDownload]),
    currentUploadMbps: parseRateMbps(a[FIELD_MAP.currentUpload]),
    operator: a[FIELD_MAP.operator] || '',
    raw: {
      rsrp: a[FIELD_MAP.rsrpRaw] || '',
      rssi: a[FIELD_MAP.rssiRaw] || '',
      rsrq: a[FIELD_MAP.rsrqRaw] || '',
      sinr: a[FIELD_MAP.sinrRaw] || ''
    }
  };
}

async function readInput() {
  const file = process.argv[2];
  if (file) return readFile(file, 'utf8');
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const input = await readInput();
const parsed = parseWanStatus(input);
console.log(JSON.stringify(parsed, null, 2));
