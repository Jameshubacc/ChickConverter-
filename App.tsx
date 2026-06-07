import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Vibration, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency, findCurrency, formatAmount } from './src/currencies';
import { Rates, loadCachedRates, fetchRates, isStale, convert } from './src/exchangeRates';
import CurrencyPicker from './src/CurrencyPicker';

type Key = { label: string; value: string; dark?: boolean };
const KEYS: Key[][] = [
  [{ label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: '⌫', value: 'DEL', dark: true }],
  [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: 'C', value: 'CLR', dark: true }],
  [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '', value: '' }],
  [{ label: '.', value: '.' }, { label: '0', value: '0' }, { label: '00', value: '00' }, { label: '', value: '' }],
];

export default function App() {
  const [fromCurrency, setFromCurrency] = useState<Currency>(findCurrency('JPY'));
  const [toCurrency, setToCurrency]     = useState<Currency>(findCurrency('USD'));
  const [input, setInput]               = useState('0');
  const [rates, setRates]               = useState<Rates>({});
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [loading, setLoading]           = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    (async () => {
      const [savedFrom, savedTo, cache] = await Promise.all([
        AsyncStorage.getItem('pref_from'), AsyncStorage.getItem('pref_to'), loadCachedRates(),
      ]);
      if (savedFrom) setFromCurrency(findCurrency(savedFrom));
      if (savedTo)   setToCurrency(findCurrency(savedTo));
      if (Object.keys(cache.rates).length > 0) { setRates(cache.rates); setLastUpdated(cache.lastUpdated); }
      if (isStale(cache.lastUpdated)) refresh();
    })();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { rates: r, error } = await fetchRates();
    if (!error && Object.keys(r).length > 0) { setRates(r); setLastUpdated(new Date()); }
    setLoading(false);
  }, []);

  const handleKey = (value: string) => {
    Vibration.vibrate(8);
    setInput(prev => {
      if (value === 'DEL') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (value === 'CLR') return '0';
      if (value === '.')   return prev.includes('.') ? prev : prev + '.';
      if (value === '00')  return prev === '0' ? '0' : prev.length < 12 ? prev + '00' : prev;
      if (prev === '0')    return value;
      return prev.length < 13 ? prev + value : prev;
    });
  };

  const inputAmount   = parseFloat(input) || 0;
  const resultAmount  = convert(inputAmount, fromCurrency.code, toCurrency.code, rates);
  const displayInput  = input.endsWith('.') ? formatAmount(inputAmount, fromCurrency) + '.' : formatAmount(inputAmount, fromCurrency);
  const displayResult = resultAmount !== null ? formatAmount(resultAmount, toCurrency) : '—';
  const rateLabel     = (() => {
    const r = convert(1, fromCurrency.code, toCurrency.code, rates);
    if (r === null) return Object.keys(rates).length === 0 ? 'Fetching rates…' : 'No rate';
    return `1 ${fromCurrency.code} = ${formatAmount(r, toCurrency)} ${toCurrency.code}`;
  })();

  const selectCurrency = (c: Currency) => {
    if (pickerTarget === 'from') { setFromCurrency(c); AsyncStorage.setItem('pref_from', c.code); }
    else                         { setToCurrency(c);   AsyncStorage.setItem('pref_to', c.code); }
    setPickerTarget(null);
  };

  const swap = () => {
    Vibration.vibrate(10);
    setFromCurrency(toCurrency); setToCurrency(fromCurrency);
    AsyncStorage.setItem('pref_from', toCurrency.code);
    AsyncStorage.setItem('pref_to', fromCurrency.code);
  };

  const ageLabel = (() => {
    if (loading) return 'Updating…';
    if (!lastUpdated) return 'No rates';
    const s = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (s < 60) return 'Just updated';
    if (s < 3600) return `Updated ${Math.floor(s / 60)}m ago`;
    return `Updated ${Math.floor(s / 3600)}h ago`;
  })();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={s.statusRow}>
        <View style={s.statusLeft}>
          {loading && <ActivityIndicator size="small" color="#888" style={{ marginRight: 6 }} />}
          <Text style={[s.statusText, isStale(lastUpdated) && !loading && s.stale]}>{ageLabel}</Text>
        </View>
        <TouchableOpacity onPress={refresh} disabled={loading}>
          <Text style={[s.refreshBtn, loading && { opacity: 0.4 }]}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={s.panel}>
        <TouchableOpacity style={s.currRow} onPress={() => setPickerTarget('from')}>
          <View style={s.currLeft}>
            <Text style={s.flag}>{fromCurrency.flag}</Text>
            <View><Text style={s.code}>{fromCurrency.code}</Text><Text style={s.currName}>{fromCurrency.name}</Text></View>
            <Text style={s.chevron}>›</Text>
          </View>
          <Text style={[s.amount, s.amountInput]} numberOfLines={1} adjustsFontSizeToFit>{displayInput}</Text>
        </TouchableOpacity>
        <View style={s.midBar}>
          <Text style={s.rateLabel}>{rateLabel}</Text>
          <TouchableOpacity style={s.swapBtn} onPress={swap}>
            <Text style={s.swapIcon}>⇅</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.currRow} onPress={() => setPickerTarget('to')}>
          <View style={s.currLeft}>
            <Text style={s.flag}>{toCurrency.flag}</Text>
            <View><Text style={s.code}>{toCurrency.code}</Text><Text style={s.currName}>{toCurrency.name}</Text></View>
            <Text style={s.chevron}>›</Text>
          </View>
          <Text style={[s.amount, s.amountResult]} numberOfLines={1} adjustsFontSizeToFit>{displayResult}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={s.keyRow}>
            {row.map((key, ci) => key.value === '' ? (
              <View key={ci} style={s.keyEmpty} />
            ) : (
              <TouchableOpacity key={ci} style={[s.key, key.dark && s.keyDark]} onPress={() => handleKey(key.value)} activeOpacity={0.6}>
                <Text style={s.keyLabel}>{key.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <CurrencyPicker visible={pickerTarget !== null} selected={pickerTarget === 'from' ? fromCurrency : toCurrency} onSelect={selectCurrency} onClose={() => setPickerTarget(null)} />
    </SafeAreaView>
  );
}

const ORANGE = '#FF9500', BG = '#141414';
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BG },
  statusRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  statusLeft:   { flexDirection: 'row', alignItems: 'center' },
  statusText:   { color: '#555', fontSize: 12 },
  stale:        { color: ORANGE },
  refreshBtn:   { color: ORANGE, fontSize: 20, fontWeight: '600' },
  panel:        { marginHorizontal: 16, backgroundColor: '#1e1e1e', borderRadius: 20, overflow: 'hidden' },
  currRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
  currLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flag:         { fontSize: 28 },
  code:         { color: '#fff', fontSize: 17, fontWeight: '700' },
  currName:     { color: '#666', fontSize: 12, marginTop: 1 },
  chevron:      { color: '#444', fontSize: 20, marginLeft: 2 },
  amount:       { fontSize: 32, fontWeight: '400', fontVariant: ['tabular-nums'], maxWidth: '55%' },
  amountInput:  { color: '#fff' },
  amountResult: { color: '#aaa' },
  midBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#2a2a2a' },
  rateLabel:    { color: '#444', fontSize: 11, flex: 1 },
  swapBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  swapIcon:     { color: '#000', fontSize: 18, fontWeight: '700' },
  keypad:       { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 10 },
  keyRow:       { flex: 1, flexDirection: 'row', gap: 10 },
  key:          { flex: 1, borderRadius: 14, backgroundColor: '#2c2c2c', alignItems: 'center', justifyContent: 'center' },
  keyDark:      { backgroundColor: '#3a3a3a' },
  keyEmpty:     { flex: 1 },
  keyLabel:     { color: '#fff', fontSize: 22, fontWeight: '500' },
});
