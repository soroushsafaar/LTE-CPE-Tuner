# Privacy redaction checklist

Before publishing logs, screenshots, CSV files, or GitHub issues, remove:

- exact home location and GPS coordinates
- IMEI, IMSI, ICCID, SIM serial
- CPE serial number
- public IP address
- admin session ID or cookies
- router username/password
- raw backup files
- exact Cell ID if you consider local cell association sensitive

Safe to share in most technical contexts:

- LTE band
- EARFCN
- PCI
- SINR/RSRQ/RSRP with no location
- generic city/region
- anonymized angle scan results
