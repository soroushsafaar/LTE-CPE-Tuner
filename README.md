# LTE CPE Tuner

A public-safe toolkit for optimizing LTE/TD-LTE CPE routers: live WAN-status parsing, SINR/RSRQ monitoring, angle scans, band/cell tuning notes, and repeatable field-test workflows.

This project was created from a real modem fine-tuning workflow. Private identifiers, exact user location, IMEI/serial/IP/session data, and raw personal dumps are intentionally excluded.

## What it does

- Reads `/private/GP/wan-status.live.asp` from an authenticated router admin page.
- Parses LTE fields such as Band, PCC EARFCN, PCI, Cell ID, SCC/CA, RSRP, RSRQ, SINR/CINR, DL/UL modulation, and current modem rates.
- Runs live monitoring and exports CSV.
- Runs angle scans to find the best physical direction for the modem.
- Scores candidate positions based on attachment, SCC/CA presence, SINR, RSRQ, and modulation.
- Documents reusable tuning profiles and safe test methodology.

## Compatibility

Known tested flow:

- Green Packet / Irancell TF-i60 G1 style firmware
- Hidden status endpoint: `/private/GP/wan-status.live.asp`
- LTE settings page pattern: `/private/GP/lte-setting.asp`
- Advanced page pattern: `/private/GP/advanced.asp`

Other routers can still use the methodology, but the parser indexes may need a new profile.

## Quick start: browser console

1. Log in to your router admin panel.
2. Open Developer Tools → Console.
3. Paste `src/lte-cpe-tuner.js`.
4. Run:

```js
CPE.help()
await CPE.read()
CPE.ui.open()
```

## Live monitor

```js
await CPE.monitor.start({ intervalMs: 10000, count: 30 })
CPE.monitor.export('monitor.csv')
```

## Angle scan

Keep your LTE profile fixed, rotate the modem, wait 60–90 seconds after each movement, then record a sample:

```js
await CPE.angle.read(0, 'north')
await CPE.angle.read(45, 'north-east')
await CPE.angle.read(90, 'east')
await CPE.angle.read(135, 'south-east')
await CPE.angle.read(180, 'south')
await CPE.angle.read(225, 'south-west')
await CPE.angle.read(270, 'west')
await CPE.angle.read(315, 'north-west')

CPE.angle.best()
CPE.angle.export('angle-scan.csv')
```

## Node parser

Parse a saved raw `wan-status.live.asp` dump:

```bash
npm run demo
node tools/parse-wan-status.mjs examples/wan-status-sample.txt
cat raw.txt | node tools/parse-wan-status.mjs
```

## Known-good tuning profile from the field test

This is a reusable example, not a universal prescription:

```text
LTE Settings:
Band ID: 42
Start EARFCN: 43090
End EARFCN: 43299
Network Mode Selection: Auto / TDD-FDD

Cell Selection:
Auto Select
Preferred List: empty
PCI Lock Timeout: 0

Advanced:
Fast Scan: Enable
Cell Select: First Detected
Uplink QAM64: Enable
TM8: Enable
Network Mode: CA
Uplink CDD: Disable
UE Max TX: Disable
PSM: Disable
ZUC: Disable
```

Target behavior in the test case:

```text
Band: 42
PCC EARFCN: 43092
SCC EARFCN: 43290
PCI: 29
CA/SCC: present and stable
Best physical direction found by angle scan: around 90° / east
```

## Repository map

```text
src/lte-cpe-tuner.js              Browser-console toolkit and overlay UI
tools/parse-wan-status.mjs        Node CLI parser for raw status dumps
tools/smoke-test.mjs              Basic parser test
examples/wan-status-sample.txt    Redacted sample status dump
examples/angle-scan-sample.csv    Redacted sample angle scan
docs/methodology.md               Repeatable tuning method
docs/profiles.md                  Known profiles and settings
docs/field-index-map.md           WAN status parser index map
docs/buying-guide.md              CPE buying checklist
docs/privacy-redaction.md         What to redact before publishing
bookmarklets/inject-local.md      Manual injection/bookmarklet notes
```

## Safety boundary

Use this only on your own device after logging in normally. The project does not bypass authentication, brute-force passwords, unlock SIM/network restrictions, or attack third-party systems.

## License

MIT
