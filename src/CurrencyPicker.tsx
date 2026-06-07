import React, { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Currency, CURRENCIES } from './currencies';

interface Props { visible: boolean; selected: Currency; onSelect: (c: Currency) => void; onClose: () => void; }

export default function CurrencyPicker({ visible, selected, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? CURRENCIES.filter(c => c.code.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase()))
    : CURRENCIES;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Select Currency</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.done}>Done</Text></TouchableOpacity>
        </View>
        <TextInput style={s.search} placeholder="Search…" placeholderTextColor="#555" value={query} onChangeText={setQuery} autoCorrect={false} clearButtonMode="while-editing" />
        <FlatList data={filtered} keyExtractor={item => item.code} keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.row} onPress={() => { onSelect(item); setQuery(''); onClose(); }}>
              <Text style={s.flag}>{item.flag}</Text>
              <View style={s.rowText}>
                <Text style={s.code}>{item.code}</Text>
                <Text style={s.name}>{item.name}</Text>
              </View>
              {item.code === selected.code && <Text style={s.check}>✓</Text>}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { color: '#fff', fontSize: 17, fontWeight: '600' },
  done: { color: '#f90', fontSize: 16, fontWeight: '600' },
  search: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#222', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  flag: { fontSize: 26, marginRight: 14 },
  rowText: { flex: 1 },
  code: { color: '#fff', fontSize: 16, fontWeight: '600' },
  name: { color: '#888', fontSize: 13, marginTop: 1 },
  check: { color: '#f90', fontSize: 18, fontWeight: '700' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#222', marginLeft: 60 },
});
