import AsyncStorage from '@react-native-async-storage/async-storage';

export type Rates = Record<string, number>;
const CACHE_KEY = 'er_rates_v1';
const CACHE_TIME_KEY = 'er_time_v1';
const MAX_AGE_MS = 60 * 60 * 1000;

export async function loadCachedRates(): Promise<{ rates: Rates; lastUpdated: Date | null }> {
  try {
    const [ratesJson, timeStr] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIME_KEY),
    ]);
    return {
      rates: ratesJson ? JSON.parse(ratesJson) : {},
      lastUpdated: timeStr ? new Date(timeStr) : null,
    };
  } catch { return { rates: {}, lastUpdated: null }; }
}

export async function fetchRates(): Promise<{ rates: Rates; error: string | null }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const json = await res.json();
    if (json.rates && Object.keys(json.rates).length > 0) {
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(json.rates)),
        AsyncStorage.setItem(CACHE_TIME_KEY, new Date().toISOString()),
      ]);
      return { rates: json.rates, error: null };
    }
    return { rates: {}, error: 'Empty response' };
  } catch (e: any) { return { rates: {}, error: e.message }; }
}

export function isStale(lastUpdated: Date | null): boolean {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated.getTime() > MAX_AGE_MS;
}

export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  const f = rates[from], t = rates[to];
  if (!f || !t) return null;
  return (amount / f) * t;
}
