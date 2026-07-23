# LTE CPE Tuner

ابزاری عمومی و امن برای بهینه‌سازی مودم‌های LTE/TD-LTE CPE: خواندن وضعیت WAN زنده، پایش SINR/RSRQ، اسکن زاویه‌ای، یادداشت‌های تنظیم باند/سلول و روش‌های آزمون میدانی قابل تکرار.

این پروژه از یک جریان کاری واقعی تنظیم مودم گرفته شده است. شناسه‌های خصوصی، موقعیت دقیق کاربر، IMEI/سریال/آی‌پی/داده‌های جلسه و نمونه‌های خام شخصی عمداً حذف شده‌اند.

## چه کاری انجام می‌دهد

- فایل `/private/GP/wan-status.live.asp` را از صفحه مدیریت روتر احراز هویت شده می‌خواند.
- فیلدهای LTE مانند باند، PCC EARFCN، PCI، Cell ID، SCC/CA، RSRP، RSRQ، SINR/CINR، مدولاسیون DL/UL و سرعت‌های فعلی مودم را تجزیه می‌کند.
- مانیتورینگ زنده را اجرا و CSV صادر می‌کند.
- اسکن زاویه‌ای را اجرا می‌کند تا بهترین جهت فیزیکی برای مودم را پیدا کند.
- موقعیت‌های پیشنهادی را بر اساس اتصال، حضور SCC/CA، SINR، RSRQ و مدولاسیون امتیازدهی می‌کند.
- پروفایل‌های تنظیم قابل استفاده مجدد و روش آزمون ایمن را مستندسازی می‌کند.

## سازگاری

جریان آزمایش شده شناخته شده:

- نرم‌افزار Green Packet / Irancell TF-i60 G1
- نقطه وضعیت پنهان: `/private/GP/wan-status.live.asp`
- الگوی صفحه تنظیم LTE: `/private/GP/lte-setting.asp`
- الگوی صفحه پیشرفته: `/private/GP/advanced.asp`

سایر روترها همچنان می‌توانند از این روش استفاده کنند، اما ممکن است شاخص‌های پارسر نیاز به پروفایل جدید داشته باشند.

## شروع سریع: کنسول مرورگر

1. وارد پنل مدیریت روتر خود شوید.
2. ابزارهای توسعه‌دهنده → Console را باز کنید.
3. `src/lte-cpe-tuner.js` را جای‌گذاری کنید.
4. اجرا کنید:

```js
CPE.help()
await CPE.read()
CPE.ui.open()
```

## پایش زنده

```js
await CPE.monitor.start({ intervalMs: 10000, count: 30 })
CPE.monitor.export('monitor.csv')
```

## اسکن زاویه‌ای

پروفایل LTE خود را ثابت نگه دارید، مودم را بچرخانید، ۶۰–۹۰ ثانیه پس از هر حرکت صبر کنید، سپس نمونه‌ای ثبت کنید:

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

## پارسر نود

یک نمونه ذخیره شده خام `wan-status.live.asp` را تجزیه کنید:

```bash
npm run demo
node tools/parse-wan-status.mjs examples/wan-status-sample.txt
cat raw.txt | node tools/parse-wan-status.mjs
```

## پروفایل تنظیم خوب شناخته شده از آزمایش میدانی

این یک مثال قابل استفاده مجدد است، نه یک نسخه عمومی:

```text
تنظیمات LTE:
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

رفتار هدف در مورد آزمایش:

```text
Band: 42
PCC EARFCN: 43092
SCC EARFCN: 43290
PCI: 29
CA/SCC: present and stable
Best physical direction found by angle scan: around 90° / east
```

## نقشه مخزن

```text
src/lte-cpe-tuner.js              ابزار کنسول مرورگر و رابط کاربری پوششی
tools/parse-wan-status.mjs        پارسر CLI نود برای نمونه‌های خام وضعیت
tools/smoke-test.mjs              تست پایه پارسر
examples/wan-status-sample.txt    نمونه وضعیت قرمز شده
examples/angle-scan-sample.csv    نمونه اسکن زاویه‌ای قرمز شده
docs/methodology.md               روش قابل تکرار تنظیم
docs/profiles.md                  پروفایل‌ها و تنظیمات شناخته شده
docs/field-index-map.md           نقشه شاخص پارسر وضعیت WAN
docs/buying-guide.md              چک‌لیست خرید CPE
docs/privacy-redaction.md         چه چیزهایی قبل از انتشار باید حذف شوند
bookmarklets/inject-local.md      یادداشت‌های تزریق دستی/بوکمارک‌لت
```

## مرز ایمنی

این را فقط روی دستگاه خود و پس از ورود عادی استفاده کنید. پروژه احراز هویت را دور نمی‌زند، رمز عبور را جست‌وجو نمی‌کند، سیم/محدودیت شبکه را باز نمی‌کند یا به سامانه‌های شخص ثالث حمله نمی‌کند.

## مجوز

MIT
