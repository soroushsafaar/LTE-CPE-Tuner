# Profiles and settings

## Field-tested B42 narrow profile

This profile came from a TD-LTE Band 42 optimization workflow.

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

Expected good state:

```text
Band: 42
PCC EARFCN: 43092
SCC EARFCN: 43290
PCI: stable
SCC/CA: present
SINR/CINR: stable and high
```

## Settings that helped

### Cell Select: First Detected

In the test case, `First Detected` selected a better PCC/SCC arrangement than `Strongest`. Stronger signal was not the same as best throughput.

### Narrow Band 42 EARFCN range

A narrow B42 range kept the router on a better carrier pair and avoided a problematic candidate cell.

## Settings that did not help

### TDD Only

In the test case, `TDD Only` had no meaningful improvement over `Auto / TDD-FDD`.

### Uplink CDD

In the test case, enabling `Uplink CDD` caused link loss. It should remain disabled unless a separate controlled test proves otherwise.

### UE Max TX

Not recommended as a default. It can increase heat/noise or destabilize marginal links. Test only after the stable profile is saved.

## Recovery profile

If a tuning change breaks data:

```text
Cell Selection: Auto Select
Preferred List: empty
PCI Lock Timeout: 0
Uplink CDD: Disable
UE Max TX: Disable
Network Mode: CA or Auto
Reboot if attach does not recover
```
