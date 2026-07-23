# Buying guide for a better LTE/TD-LTE CPE

## Best class for this workflow

Outdoor CPE is usually better when the target band is high frequency, such as TD-LTE around 3.5 GHz, because placement, line-of-sight, and directionality matter a lot.

Recommended priority:

1. Outdoor LTE/5G CPE with LTE B42/B43, CA, and real Band/Cell lock.
2. Indoor CPE with external 2x2 or 4x4 MIMO antenna support for 3.5 GHz and open firmware.
3. Indoor CPE with no external antenna and limited firmware.

## Required features

Ask the seller for screenshots or video proof of:

```text
LTE Band 42 support
LTE Band 43 support if available
5G n78 support if 5G is relevant
Band Lock
Cell Lock / PCI Lock / EARFCN Lock
Status page showing SINR, RSRQ, RSRP, PCI, EARFCN, CA/SCC
PoE for outdoor installation
Firmware/super-admin access that survives reboot/reset
```

## Marketing claims to treat carefully

```text
2.4 Gbps download
1 Gbps upload
Gaming/trading optimized
Works in bad signal areas
Permanent super admin
All SIM cards supported
```

These claims may be true in a limited sense, but real performance depends on supported bands, carrier aggregation, cell congestion, SINR, and firmware control.

## Outdoor installation tips

- Aim the CPE toward the best angle found by the indoor angle scan.
- Use PoE and keep RF hardware outside rather than using long RF cables.
- Use a separate indoor router for Wi-Fi and SQM/QoS if latency matters.
- Weather sealing and cable entry matter for long-term stability.

## What not to buy

Avoid devices that:

- do not explicitly support LTE Band 42 for a B42 TD-LTE service
- have no Band Lock or Cell Lock
- hide SINR/RSRQ/PCI/EARFCN
- are locked to a closed operator firmware
- only cover 700–2700 MHz when your target is around 3.5 GHz
