import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { THEME, BUILTIN_ASSETS } from '../src/config/network';
import { t } from '../src/i18n';
import { loadCustomAssets, saveCustomAssets } from '../src/services/storage';
import { getErc20Meta } from '../src/services/eth';

export default function AssetsScreen() {
  const [custom, setCustom] = useState([]);
  const [contract, setContract] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCustomAssets().then(setCustom);
    }, [])
  );

  const addToken = async () => {
    const c = contract.trim();
    if (!c.startsWith('0x') || c.length < 42) {
      Alert.alert(t('error'), 'Invalid contract');
      return;
    }
    setBusy(true);
    try {
      const meta = await getErc20Meta(c);
      const list = await loadCustomAssets();
      if (list.some((x) => x.contract?.toLowerCase() === c.toLowerCase())) {
        Alert.alert('OK', 'Already added');
        return;
      }
      const item = {
        id: 'erc20_' + c.slice(2, 10),
        symbol: meta.symbol,
        name: meta.name,
        type: 'erc20',
        decimals: meta.decimals,
        contract: c,
        coingeckoId: null
      };
      const next = [...list, item];
      await saveCustomAssets(next);
      setCustom(next);
      setContract('');
      Alert.alert('OK', meta.symbol + ' added');
    } catch (e) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    const next = custom.filter((x) => x.id !== id);
    await saveCustomAssets(next);
    setCustom(next);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{t('assets')}</Text>

      <Text style={styles.section}>Built-in</Text>
      {BUILTIN_ASSETS.map((a) => (
        <View key={a.id} style={styles.row}>
          <Text style={styles.sym}>{a.symbol}</Text>
          <Text style={styles.muted}>{a.name}</Text>
        </View>
      ))}

      <Text style={styles.section}>{t('add_token')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('contract')}
        placeholderTextColor={THEME.muted}
        value={contract}
        onChangeText={setContract}
        autoCapitalize="none"
      />
      <Pressable style={[styles.btn, busy && { opacity: 0.5 }]} onPress={addToken} disabled={busy}>
        <Text style={styles.btnText}>{t('save')}</Text>
      </Pressable>

      <Text style={styles.section}>Custom ERC-20</Text>
      {custom.length === 0 ? (
        <Text style={styles.muted}>—</Text>
      ) : (
        custom.map((a) => (
          <View key={a.id} style={styles.row}>
            <View>
              <Text style={styles.sym}>{a.symbol}</Text>
              <Text style={styles.muted}>{a.contract.slice(0, 12)}…</Text>
            </View>
            <Pressable onPress={() => remove(a.id)}>
              <Text style={{ color: THEME.danger }}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  title: { fontSize: 22, fontWeight: '800', color: THEME.text, marginBottom: 12 },
  section: { color: THEME.muted, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    marginBottom: 8
  },
  sym: { color: THEME.text, fontWeight: '700' },
  muted: { color: THEME.muted, fontSize: 12 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: THEME.text,
    marginBottom: 10
  },
  btn: { backgroundColor: THEME.accent, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#022c22', fontWeight: '800' }
});
