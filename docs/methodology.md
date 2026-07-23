# Methodology: LTE/TD-LTE CPE fine-tuning

## Goal

Find a configuration that maximizes stable usable throughput, not just signal bars.

Important metrics:

- `SINR/CINR`: higher is better; this usually matters more than bars.
- `RSRQ`: closer to zero is better; roughly -7 to -9 dB is good for many LTE situations.
- `RSRP`: signal strength; useful, but strong signal with bad SINR can still be slow.
- `PCC EARFCN`: primary carrier.
- `SCC/CA`: secondary carrier / carrier aggregation indication.
- `PCI`: physical cell ID; changes can indicate a different sector/cell.
- `DL/UL modulation`: higher-order modulation usually indicates better link quality.

## Workflow

1. Establish a baseline on automatic settings.
2. Find which LTE bands actually attach and pass traffic.
3. Compare bands using identical test conditions.
4. Keep the band that has the best combination of CA/SCC, SINR, RSRQ, and throughput.
5. Narrow the EARFCN range only when it improves stability or avoids a bad neighboring cell.
6. Test advanced settings one at a time.
7. Use angle scans to optimize physical placement.
8. Confirm stability with multiple speed tests at different times of day.

## Do not optimize using bars alone

A lower bar count can still be faster if:

- the cell is less congested
- SINR is better
- RSRQ is cleaner
- carrier aggregation is active
- the selected PCI/sector is better

## Recommended test discipline

Change one variable at a time:

```text
Band range → test
Cell Select mode → test
Advanced option → test
Physical angle → test
```

After each change:

- wait 60–90 seconds
- confirm attach state
- confirm PCC/SCC/PCI did not shift unexpectedly
- collect at least one status sample
- run 2–3 speed tests only after radio status looks stable

## Angle scan method

1. Put the CPE in the best candidate location: near a window, high, away from metal and electronics.
2. Keep LTE settings fixed.
3. Rotate in 45° steps: 0, 45, 90, 135, 180, 225, 270, 315.
4. Wait 60–90 seconds after each rotation.
5. Run `await CPE.angle.read(angle, note)`.
6. Pick the best region.
7. Fine-tune in 10° or 15° steps around the best region.

## Bufferbloat note

If download is good but loaded latency is high during upload, LTE tuning alone may not solve it. Use a router with SQM/QoS and set rate limits below the stable LTE throughput.
