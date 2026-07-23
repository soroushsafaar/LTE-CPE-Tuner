# WAN status field index map

Endpoint:

```text
/private/GP/wan-status.live.asp
```

The response contains blocks like:

```text
{ue_state_info::field0;field1;field2;...}
{ue_scc_info::...}
{ue_freqDl_info::...}
```

Known indexes from the tested firmware:

| Index | Meaning | Notes |
|---:|---|---|
| 9 | RSRP raw list | Usually scaled by 100. Example `-9560` → `-95.60 dBm`. |
| 10 | RSSI raw list | Usually scaled by 100. |
| 14 | PCC/DL EARFCN | Primary carrier. |
| 15 | UL EARFCN | For TDD it may match or mirror the carrier. |
| 16 | Attach state | Example: `ATTACHED`. |
| 17 | SIM state | Example: `Ready`. |
| 18 | Signal bars / quality indicator | Vendor-specific. |
| 32 | PCI | Physical Cell ID. |
| 35 | RSRQ raw list | Usually scaled by 100. |
| 48 | Frequency-like value | Vendor-specific. |
| 49 | Transmission mode | Example: `TM4`. |
| 50 | Rank/layer/vendor field | Not fully confirmed. |
| 51 | DL modulation/MCS-like value | Example: `QAM16(23)`. |
| 52 | UL modulation/MCS-like value | Example: `QPSK(6)`. |
| 53 | LTE band | Example: `42`. |
| 54 | Cell ID | Redact before publishing if needed. |
| 55 | SCC summary | Example: `PCI,EARFCN,BandwidthMHz`. |
| 56 | Current upload rate | Vendor live rate, not necessarily speed-test result. |
| 57 | Current download rate | Vendor live rate, not necessarily speed-test result. |
| 62 | IP address | Redact before publishing. |
| 66 | Operator | Example: operator name. |
| 67 | SINR/CINR raw list | Usually scaled by 100; zeros are often ignored. |

Use `console.table(CPE.parseWanStatus(raw).raw.mainFields.map((value, index) => ({ index, value })))` to inspect all fields.
