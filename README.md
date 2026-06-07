# Currency Converter

A fast, calculator-style currency converter built as a **Progressive Web App** — plain HTML, CSS, and JavaScript, no frameworks. Optimized for iPhone.

## Features

- 🧮 Calculator-style keypad with instant conversion as you type
- 🌍 36 currencies, searchable by name or code
- 💱 Live exchange rates from [open.er-api.com](https://open.er-api.com) (no API key)
- 📴 Rates cached locally (`localStorage`) — works offline
- 📱 Installable to the home screen (Add to Home Screen) with its own icon
- 🎯 Adaptive precision — tiny rates like `1 VND = 0.00003811 USD` display correctly
- 🌑 Dark, native-feeling UI: no zoom, no bounce, instant taps

## Run locally

```bash
python3 -m http.server 8090
# then open http://localhost:8090
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | App structure |
| `style.css`  | Dark calculator UI |
| `app.js`     | Currencies, rates, conversion logic |
| `manifest.json` | PWA manifest (installable) |
| `sw.js`      | Service worker (offline cache) |
| `*.png`      | Home-screen icons |
