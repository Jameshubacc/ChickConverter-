'use strict';

// ── Currency data ────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code:'USD', name:'US Dollar',          flag:'🇺🇸', zero:false },
  { code:'EUR', name:'Euro',               flag:'🇪🇺', zero:false },
  { code:'JPY', name:'Japanese Yen',       flag:'🇯🇵', zero:true  },
  { code:'GBP', name:'British Pound',      flag:'🇬🇧', zero:false },
  { code:'CAD', name:'Canadian Dollar',    flag:'🇨🇦', zero:false },
  { code:'AUD', name:'Australian Dollar',  flag:'🇦🇺', zero:false },
  { code:'CHF', name:'Swiss Franc',        flag:'🇨🇭', zero:false },
  { code:'CNY', name:'Chinese Yuan',       flag:'🇨🇳', zero:false },
  { code:'HKD', name:'Hong Kong Dollar',   flag:'🇭🇰', zero:false },
  { code:'SGD', name:'Singapore Dollar',   flag:'🇸🇬', zero:false },
  { code:'KRW', name:'South Korean Won',   flag:'🇰🇷', zero:true  },
  { code:'INR', name:'Indian Rupee',       flag:'🇮🇳', zero:false },
  { code:'MXN', name:'Mexican Peso',       flag:'🇲🇽', zero:false },
  { code:'BRL', name:'Brazilian Real',     flag:'🇧🇷', zero:false },
  { code:'NOK', name:'Norwegian Krone',    flag:'🇳🇴', zero:false },
  { code:'SEK', name:'Swedish Krona',      flag:'🇸🇪', zero:false },
  { code:'DKK', name:'Danish Krone',       flag:'🇩🇰', zero:false },
  { code:'NZD', name:'New Zealand Dollar', flag:'🇳🇿', zero:false },
  { code:'ZAR', name:'South African Rand', flag:'🇿🇦', zero:false },
  { code:'AED', name:'UAE Dirham',         flag:'🇦🇪', zero:false },
  { code:'SAR', name:'Saudi Riyal',        flag:'🇸🇦', zero:false },
  { code:'THB', name:'Thai Baht',          flag:'🇹🇭', zero:false },
  { code:'IDR', name:'Indonesian Rupiah',  flag:'🇮🇩', zero:true  },
  { code:'MYR', name:'Malaysian Ringgit',  flag:'🇲🇾', zero:false },
  { code:'PHP', name:'Philippine Peso',    flag:'🇵🇭', zero:false },
  { code:'PLN', name:'Polish Złoty',       flag:'🇵🇱', zero:false },
  { code:'CZK', name:'Czech Koruna',       flag:'🇨🇿', zero:false },
  { code:'HUF', name:'Hungarian Forint',   flag:'🇭🇺', zero:true  },
  { code:'TRY', name:'Turkish Lira',       flag:'🇹🇷', zero:false },
  { code:'TWD', name:'Taiwan Dollar',      flag:'🇹🇼', zero:false },
  { code:'ILS', name:'Israeli Shekel',     flag:'🇮🇱', zero:false },
  { code:'QAR', name:'Qatari Riyal',       flag:'🇶🇦', zero:false },
  { code:'KWD', name:'Kuwaiti Dinar',      flag:'🇰🇼', zero:false },
  { code:'VND', name:'Vietnamese Dong',    flag:'🇻🇳', zero:true  },
  { code:'PKR', name:'Pakistani Rupee',    flag:'🇵🇰', zero:false },
  { code:'CLP', name:'Chilean Peso',       flag:'🇨🇱', zero:true  },
];

function findCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

// ── State ────────────────────────────────────────────────────────────────────
let rates       = JSON.parse(localStorage.getItem('er_rates') || '{}');
let lastUpdated = localStorage.getItem('er_time') ? new Date(localStorage.getItem('er_time')) : null;
let fromCode    = localStorage.getItem('pref_from') || 'JPY';
let toCode      = localStorage.getItem('pref_to')   || 'USD';
let input       = '0';
let pickerTarget = null; // 'from' | 'to'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(amount, currency) {
  if (amount === null || isNaN(amount)) return '—';
  if (amount === 0) return '0';
  const abs = Math.abs(amount);

  // Large amounts: whole numbers, grouped — e.g. 1,234,567
  if (abs >= 10000) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  // Normal amounts (>= 1): 2 decimals, or 0 for zero-decimal currencies (JPY, VND, KRW…)
  if (abs >= 1) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currency.zero ? 0 : 2,
    });
  }
  // Small amounts (< 1): adaptive precision so tiny rates aren't rounded to "0".
  // e.g. 1 VND -> "0.0000395" instead of "0"
  return amount.toLocaleString('en-US', { maximumSignificantDigits: 4 });
}

function convert(amount, from, to) {
  const f = rates[from], t = rates[to];
  if (!f || !t) return null;
  return (amount / f) * t;
}

function ageLabel() {
  if (!lastUpdated) return 'No rates loaded';
  const s = Math.floor((Date.now() - lastUpdated) / 1000);
  if (s < 60)   return 'Just updated';
  if (s < 3600) return `Updated ${Math.floor(s / 60)}m ago`;
  return `Updated ${Math.floor(s / 3600)}h ago`;
}

function isStale() {
  return !lastUpdated || (Date.now() - lastUpdated) > 3_600_000;
}

function vibrate(ms = 8) {
  navigator.vibrate && navigator.vibrate(ms);
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const from   = findCurrency(fromCode);
  const to     = findCurrency(toCode);
  const amount = parseFloat(input) || 0;
  const result = convert(amount, fromCode, toCode);

  // From row
  document.getElementById('from-flag').textContent  = from.flag;
  document.getElementById('from-code').textContent  = from.code;
  document.getElementById('from-name').textContent  = from.name;

  const trailingDot = input.endsWith('.');
  const inputDisplay = fmt(amount, from) + (trailingDot ? '.' : '');
  const inputEl = document.getElementById('input-amount');
  inputEl.textContent = inputDisplay;
  setAmountSize(inputEl, inputDisplay.length);

  // To row
  document.getElementById('to-flag').textContent  = to.flag;
  document.getElementById('to-code').textContent  = to.code;
  document.getElementById('to-name').textContent  = to.name;

  const resultDisplay = result !== null ? fmt(result, to) : (Object.keys(rates).length ? 'No rate' : '—');
  const resultEl = document.getElementById('result-amount');
  resultEl.textContent = resultDisplay;
  setAmountSize(resultEl, resultDisplay.length);

  // Rate label
  const rate1 = convert(1, fromCode, toCode);
  document.getElementById('rate-label').textContent = rate1 !== null
    ? `1 ${from.code} = ${fmt(rate1, to)} ${to.code}`
    : Object.keys(rates).length ? 'Rate unavailable' : 'Loading rates…';

  // Status
  const statusEl = document.getElementById('status-text');
  statusEl.textContent = ageLabel();
  statusEl.classList.toggle('stale', isStale());
}

function setAmountSize(el, len) {
  el.className = 'amount ' + (el.id === 'input-amount' ? 'input-amount' : 'result-amount') +
    (len > 12 ? ' small' : len > 8 ? ' medium' : ' large');
}

// ── Keypad ───────────────────────────────────────────────────────────────────
function handleKey(val) {
  vibrate(8);
  switch (val) {
    case 'DEL':
      input = input.length > 1 ? input.slice(0, -1) : '0';
      break;
    case 'CLR':
      input = '0';
      break;
    case '.':
      if (!input.includes('.')) input += '.';
      break;
    case '00':
      if (input !== '0' && input.length < 12) input += '00';
      break;
    default:
      if (input === '0') input = val;
      else if (input.length < 13) input += val;
  }
  render();
}

// ── Rates ────────────────────────────────────────────────────────────────────
async function fetchRates() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.classList.add('spinning');
  document.getElementById('status-text').textContent = 'Updating…';

  try {
    const res  = await fetch('https://open.er-api.com/v6/latest/USD');
    const json = await res.json();
    if (json.rates && Object.keys(json.rates).length) {
      rates       = json.rates;
      lastUpdated = new Date();
      localStorage.setItem('er_rates', JSON.stringify(rates));
      localStorage.setItem('er_time',  lastUpdated.toISOString());
    }
  } catch (_) { /* use cached */ }

  btn.disabled = false;
  btn.classList.remove('spinning');
  render();
}

// ── Currency picker ──────────────────────────────────────────────────────────
function openPicker(target) {
  pickerTarget = target;
  const overlay = document.getElementById('picker-overlay');
  const search  = document.getElementById('picker-search');
  overlay.classList.add('open');
  renderPickerList('');
  setTimeout(() => search.focus(), 250);
}

function closePicker() {
  document.getElementById('picker-overlay').classList.remove('open');
  document.getElementById('picker-search').value = '';
  pickerTarget = null;
}

function renderPickerList(query) {
  const q    = query.toLowerCase();
  const list = document.getElementById('picker-list');
  const current = pickerTarget === 'from' ? fromCode : toCode;

  const filtered = q
    ? CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    : CURRENCIES;

  list.innerHTML = filtered.map(c => `
    <div class="picker-item" data-code="${c.code}">
      <span class="picker-flag">${c.flag}</span>
      <div class="picker-info">
        <div class="picker-code">${c.code}</div>
        <div class="picker-name">${c.name}</div>
      </div>
      ${c.code === current ? '<span class="picker-check">✓</span>' : ''}
    </div>
  `).join('');

  list.querySelectorAll('.picker-item').forEach(el => {
    el.addEventListener('click', () => {
      const code = el.dataset.code;
      if (pickerTarget === 'from') { fromCode = code; localStorage.setItem('pref_from', code); }
      else                         { toCode   = code; localStorage.setItem('pref_to',   code); }
      closePicker();
      render();
    });
  });
}

function swap() {
  vibrate(10);
  [fromCode, toCode] = [toCode, fromCode];
  localStorage.setItem('pref_from', fromCode);
  localStorage.setItem('pref_to',   toCode);
  render();
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Keypad — fire on pointerdown (finger-down) for instant, native-feeling response.
  // Using click would add the browser's tap delay; pointerdown triggers immediately.
  document.querySelectorAll('.key:not(.empty)').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();           // no focus flicker / synthetic click
      handleKey(btn.dataset.val);
    });
  });

  // Block pinch-zoom gestures (iOS Safari ignores user-scalable=no, so we stop these too)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => {
    document.addEventListener(ev, e => e.preventDefault(), { passive: false });
  });
  // Block double-tap-to-zoom fallback
  let lastTouch = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  // Swap
  document.getElementById('swap-btn').addEventListener('click', swap);

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', fetchRates);

  // Currency rows
  document.getElementById('from-row').addEventListener('click', () => openPicker('from'));
  document.getElementById('to-row').addEventListener('click',   () => openPicker('to'));

  // Picker
  document.getElementById('picker-close').addEventListener('click', closePicker);
  document.getElementById('picker-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePicker();
  });
  document.getElementById('picker-search').addEventListener('input', e => {
    renderPickerList(e.target.value.trim());
  });

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Initial render + fetch
  render();
  if (isStale()) fetchRates();
  else setInterval(render, 30_000); // update age label every 30s
});
