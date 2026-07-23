# Injection options

## Console paste

Open router admin panel → Developer Tools → Console → paste `src/lte-cpe-tuner.js`.

Then run:

```js
CPE.ui.open()
```

## Local bookmarklet pattern

Many router admin pages block remote scripts or run without internet access, so console paste is the most reliable method.

A remote bookmarklet can be built after you publish your own trusted copy:

```js
javascript:(()=>{const s=document.createElement('script');s.src='https://YOUR_DOMAIN_OR_RAW_URL/lte-cpe-tuner.js';document.body.appendChild(s)})()
```

Use only your own trusted script URL. Do not inject random remote scripts into a router admin page.
