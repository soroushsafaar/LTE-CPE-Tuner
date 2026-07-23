/*
 * LTE CPE Tuner
 * Browser-console toolkit for authorized LTE/TD-LTE CPE optimization.
 * Tested flow: authenticated router UI -> /private/GP/wan-status.live.asp
 */
(function initLteCpeTuner(global) {
  'use strict';

  const DEFAULT_ENDPOINT = '/private/GP/wan-status.live.asp';
  const VERSION = '0.1.0';

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
    freqLike: 48,
    transmissionMode: 49,
    rankOrLayer: 50,
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

  const KNOWN_GOOD_PROFILE_B42 = {
    name: 'Known good B42 narrow CA profile',
    lteSettings: {
      bandId: 42,
      startEarfcn: 43090,
      endEarfcn: 43299,
      networkModeSelection: 'Auto / TDD-FDD'
    },
    cellSelection: {
      mode: 'Auto Select',
      preferredList: 'empty',
      pciLockTimeout: 0
    },
    advanced: {
      fastScan: 'Enable',
      cellSelect: 'First Detected',
      uplinkQam64: 'Enable',
      tm8: 'Enable',
      networkMode: 'CA',
      uplinkCdd: 'Disable',
      ueMaxTx: 'Disable',
      psm: 'Disable',
      zuc: 'Disable'
    },
    target: {
      band: '42',
      pccEarfcn: '43092',
      sccContains: '43290',
      pci: '29'
    }
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

  function min(values, digits = 2) {
    if (!values.length) return null;
    return Number(Math.min(...values).toFixed(digits));
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

    const summary = {
      time: new Date().toLocaleTimeString(),
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
      rsrpMaxDbm: max(rsrpList),
      rsrpMinDbm: min(rsrpList),
      rssiAvgDbm: avg(rssiList),
      rsrqAvgDb: avg(rsrqList),
      rsrqBestDb: max(rsrqList),
      sinrAvgDb: avg(sinrList),
      sinrBestDb: max(sinrList),
      sinrWorstDb: min(sinrList),
      currentDownload: a[FIELD_MAP.currentDownload] || '',
      currentUpload: a[FIELD_MAP.currentUpload] || '',
      currentDownloadMbps: parseRateMbps(a[FIELD_MAP.currentDownload]),
      currentUploadMbps: parseRateMbps(a[FIELD_MAP.currentUpload]),
      ip: a[FIELD_MAP.ip] || '',
      operator: a[FIELD_MAP.operator] || '',
      raw: {
        rsrp: a[FIELD_MAP.rsrpRaw] || '',
        rssi: a[FIELD_MAP.rssiRaw] || '',
        rsrq: a[FIELD_MAP.rsrqRaw] || '',
        sinr: a[FIELD_MAP.sinrRaw] || '',
        mainFields: a
      }
    };

    summary.score = scoreStatus(summary);
    summary.profileMatch = matchProfile(summary, KNOWN_GOOD_PROFILE_B42);
    return summary;
  }

  function matchProfile(s, profile) {
    const target = profile.target || {};
    return {
      band: !target.band || s.band === target.band,
      pccEarfcn: !target.pccEarfcn || s.pccEarfcn === target.pccEarfcn,
      pci: !target.pci || s.pci === target.pci,
      scc: !target.sccContains || String(s.scc || '').includes(target.sccContains) || String(s.sccRaw || '').includes(target.sccContains)
    };
  }

  function scoreStatus(s) {
    let score = 0;
    if (s.attach === 'ATTACHED') score += 20;
    if (s.scc && s.scc !== '-') score += 20;
    if (Number.isFinite(s.sinrAvgDb)) score += Math.max(-20, Math.min(40, s.sinrAvgDb * 2));
    if (Number.isFinite(s.rsrqAvgDb)) score += Math.max(-20, Math.min(20, (s.rsrqAvgDb + 16) * 2));
    if (/QAM64/i.test(s.dlModulation)) score += 15;
    if (/QAM16/i.test(s.dlModulation)) score += 8;
    if (/QAM16/i.test(s.ulModulation)) score += 5;
    if (s.currentDownloadMbps) score += Math.min(10, s.currentDownloadMbps / 10);
    return Number(score.toFixed(2));
  }

  async function fetchStatus(endpoint = DEFAULT_ENDPOINT) {
    const response = await fetch(endpoint, {
      credentials: 'include',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${endpoint}`);
    return response.text();
  }

  async function read(endpoint = DEFAULT_ENDPOINT, options = {}) {
    const rawText = await fetchStatus(endpoint);
    const parsed = parseWanStatus(rawText);
    if (options.raw) console.log(rawText);
    if (options.table !== false) console.table(parsed);
    return parsed;
  }

  const state = {
    monitorRows: [],
    angleRows: [],
    lastRaw: '',
    monitorTimer: null
  };

  function toCsv(rows) {
    if (!rows.length) return '';
    const keys = Object.keys(rows[0]);
    return [
      keys.join(','),
      ...rows.map(row => keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  }

  function downloadText(filename, text, mime = 'text/plain') {
    const blob = new Blob([text], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 3000);
  }

  function compactRow(summary, extra = {}) {
    return {
      ...extra,
      time: summary.time,
      attach: summary.attach,
      band: summary.band,
      pccEarfcn: summary.pccEarfcn,
      pci: summary.pci,
      cellId: summary.cellId,
      dlModulation: summary.dlModulation,
      ulModulation: summary.ulModulation,
      scc: summary.scc,
      sinrAvgDb: summary.sinrAvgDb,
      sinrBestDb: summary.sinrBestDb,
      rsrqAvgDb: summary.rsrqAvgDb,
      rsrqBestDb: summary.rsrqBestDb,
      rsrpAvgDbm: summary.rsrpAvgDbm,
      currentDownload: summary.currentDownload,
      currentUpload: summary.currentUpload,
      score: summary.score
    };
  }

  const monitor = {
    async sample(note = '') {
      const rawText = await fetchStatus();
      state.lastRaw = rawText;
      const summary = parseWanStatus(rawText);
      const row = compactRow(summary, { note });
      state.monitorRows.push(row);
      console.table(state.monitorRows);
      return row;
    },
    async start({ intervalMs = 10000, count = 30, note = '' } = {}) {
      this.stop();
      state.monitorRows = [];
      let i = 0;
      const tick = async () => {
        i += 1;
        try {
          await this.sample(note);
        } catch (err) {
          console.error(err);
        }
        if (count && i >= count) this.stop();
      };
      await tick();
      state.monitorTimer = setInterval(tick, intervalMs);
      return state.monitorRows;
    },
    stop() {
      if (state.monitorTimer) clearInterval(state.monitorTimer);
      state.monitorTimer = null;
    },
    clear() {
      state.monitorRows = [];
      console.table(state.monitorRows);
    },
    export(filename = 'lte-monitor.csv') {
      downloadText(filename, toCsv(state.monitorRows), 'text/csv');
    },
    rows() {
      return state.monitorRows;
    }
  };

  const angle = {
    async read(angleDeg, note = '') {
      const rawText = await fetchStatus();
      state.lastRaw = rawText;
      const summary = parseWanStatus(rawText);
      const row = compactRow(summary, { angleDeg, note });
      state.angleRows.push(row);
      console.clear();
      console.log('B42 angle scan table');
      console.table(state.angleRows);
      console.log('Best rows by score');
      console.table(this.best(5));
      return row;
    },
    best(limit = 5) {
      return [...state.angleRows]
        .sort((a, b) => {
          const sa = Number.isFinite(a.score) ? a.score : -Infinity;
          const sb = Number.isFinite(b.score) ? b.score : -Infinity;
          if (sb !== sa) return sb - sa;
          return (b.sinrAvgDb ?? -Infinity) - (a.sinrAvgDb ?? -Infinity);
        })
        .slice(0, limit);
    },
    clear() {
      state.angleRows = [];
      console.table(state.angleRows);
    },
    export(filename = 'lte-angle-scan.csv') {
      downloadText(filename, toCsv(state.angleRows), 'text/csv');
    },
    rows() {
      return state.angleRows;
    }
  };

  function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'style') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    for (const child of [].concat(children)) {
      el.append(child?.nodeType ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  const ui = {
    open() {
      this.close();
      const panel = createEl('div', {
        id: 'lte-cpe-tuner-panel',
        style: {
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 999999,
          width: '380px',
          maxHeight: '80vh',
          overflow: 'auto',
          background: '#111',
          color: '#eee',
          border: '1px solid #555',
          borderRadius: '10px',
          padding: '12px',
          font: '12px/1.4 system-ui, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,.45)'
        }
      });
      const output = createEl('pre', {
        style: {
          whiteSpace: 'pre-wrap',
          background: '#1f1f1f',
          padding: '8px',
          borderRadius: '8px',
          minHeight: '110px'
        }
      }, ['Ready.']);
      const buttonStyle = {
        margin: '4px',
        padding: '6px 8px',
        borderRadius: '6px',
        border: '1px solid #777',
        background: '#2d2d2d',
        color: '#eee',
        cursor: 'pointer'
      };
      const setOut = data => {
        output.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      };
      const btn = (label, fn) => createEl('button', { style: buttonStyle, onclick: fn }, [label]);

      panel.append(
        createEl('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
          createEl('strong', {}, [`LTE CPE Tuner v${VERSION}`]),
          btn('×', () => this.close())
        ]),
        createEl('div', { style: { marginTop: '8px' } }, [
          btn('Read status', async () => setOut(await read(DEFAULT_ENDPOINT, { table: false }))),
          btn('Add angle', async () => {
            const deg = prompt('Angle degree, e.g. 90');
            if (deg == null) return;
            const note = prompt('Note, e.g. east') || '';
            setOut(await angle.read(Number(deg), note));
          }),
          btn('Best angles', () => setOut(angle.best(10))),
          btn('Export angles', () => angle.export()),
          btn('Monitor sample', async () => setOut(await monitor.sample())),
          btn('Export monitor', () => monitor.export())
        ]),
        output
      );
      document.body.append(panel);
    },
    close() {
      document.getElementById('lte-cpe-tuner-panel')?.remove();
    }
  };

  const CPE = {
    VERSION,
    DEFAULT_ENDPOINT,
    FIELD_MAP,
    profiles: { knownGoodB42: KNOWN_GOOD_PROFILE_B42 },
    state,
    extractBlock,
    toNumberList,
    parseWanStatus,
    scoreStatus,
    matchProfile,
    fetchStatus,
    read,
    monitor,
    angle,
    toCsv,
    downloadText,
    ui,
    help() {
      console.log(`LTE CPE Tuner v${VERSION}\n\nCommon commands:\nawait CPE.read()\nawait CPE.monitor.start({ intervalMs: 10000, count: 30 })\nawait CPE.angle.read(90, 'east')\nCPE.angle.best()\nCPE.angle.export()\nCPE.ui.open()`);
    }
  };

  global.CPE = CPE;
  console.log(`LTE CPE Tuner v${VERSION} loaded. Run CPE.help() or CPE.ui.open().`);
})(window);
