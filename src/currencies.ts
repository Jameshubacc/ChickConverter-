export interface Currency { code: string; name: string; flag: string; zeroDecimal?: boolean; }

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar',           flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                flag: '🇪🇺' },
  { code: 'JPY', name: 'Japanese Yen',        flag: '🇯🇵', zeroDecimal: true },
  { code: 'GBP', name: 'British Pound',       flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar',     flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar',   flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc',         flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan',        flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar',    flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore Dollar',    flag: '🇸🇬' },
  { code: 'KRW', name: 'South Korean Won',    flag: '🇰🇷', zeroDecimal: true },
  { code: 'INR', name: 'Indian Rupee',        flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso',        flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real',      flag: '🇧🇷' },
  { code: 'NOK', name: 'Norwegian Krone',     flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona',       flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone',        flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar',  flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand',  flag: '🇿🇦' },
  { code: 'AED', name: 'UAE Dirham',          flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal',         flag: '🇸🇦' },
  { code: 'THB', name: 'Thai Baht',           flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah',   flag: '🇮🇩', zeroDecimal: true },
  { code: 'MYR', name: 'Malaysian Ringgit',   flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso',     flag: '🇵🇭' },
  { code: 'PLN', name: 'Polish Złoty',        flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna',        flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint',    flag: '🇭🇺', zeroDecimal: true },
  { code: 'TRY', name: 'Turkish Lira',        flag: '🇹🇷' },
  { code: 'TWD', name: 'Taiwan Dollar',       flag: '🇹🇼' },
  { code: 'ILS', name: 'Israeli Shekel',      flag: '🇮🇱' },
  { code: 'QAR', name: 'Qatari Riyal',        flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar',       flag: '🇰🇼' },
  { code: 'VND', name: 'Vietnamese Dong',     flag: '🇻🇳', zeroDecimal: true },
  { code: 'PKR', name: 'Pakistani Rupee',     flag: '🇵🇰' },
  { code: 'CLP', name: 'Chilean Peso',        flag: '🇨🇱', zeroDecimal: true },
];

export function findCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

export function formatAmount(amount: number, currency: Currency): string {
  if (isNaN(amount)) return '—';
  const decimals = currency.zeroDecimal ? 0 : amount >= 10000 ? 0 : 2;
  return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}
