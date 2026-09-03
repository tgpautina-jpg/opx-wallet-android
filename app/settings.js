import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { THEME, OPX_NETWORK } from '../src/config/network';
import { t, setLang, getLang } from '../src/i18n';
import { loadSettings, saveSettings } from '../src/services/storage';

export default function SettingsScreen() {
  const [walletRpcUrl, setWalletRpcUrl] = useState('');
  const [offlineOnly, setOfflineOnly] = useState(true);

  useEffect(() => {
    loadSettings().then(s => {
      setWalletRpcUrl(s.walletRpcUrl || '');
      setOfflineOnly(s.offlineOnly !== false);
    });
  }, []);

  const save = async () => {
    await saveSettings({
      walletRpcUrl: walletRpcUrl.trim(),
      offlineOnly
    });
    Alert.alert('OK', t('save'));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{t('settings')}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t('offline')}</Text>
        <Switch
          value={offlineOnly}
          onValueChange={setOfflineOnly}
          trackColor={{ true: THEME.accent }}
        />
      </View>

      <Text style={styles.label}>{t('node')} (wallet-rpc URL)</Text>
      <TextInput
        style={styles.input}
        value={walletRpcUrl}
        onChangeText={setWalletRpcUrl}
        placeholder="http://127.0.0.1:28984/json_rpc"
        placeholderTextColor={THEME.muted}
        autoCapitalize="none"
      />

      <Text style={styles.hint}>{t('node_hint')}</Text>

      <Pressable style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>{t('save')}</Text>
      </Pressable>

      <View style={{ height: 16 }} />
      <Text style={styles.label}>Language</Text>
      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={() => setLang('en')}>
          <Text style={styles.chipText}>EN</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => setLang('ru')}>
          <Text style={styles.chipText}>RU</Text>
        </Pressable>
      </View>

      <Text style={[styles.hint, { marginTop: 24 }]}>
        {OPX_NETWORK.name}{'\n'}
        prefix {OPX_NETWORK.addressPrefix} · P2P {OPX_NETWORK.p2pPort}
      </Text>
      <Text style={styles.hint}>{t('disclaimer')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  title: { fontSize: 22, fontWeight: '700', color: THEME.text, marginBottom: 16 },
  hint: { color: THEME.muted, fontSize: 12, marginBottom: 16 },
  label: { color: THEME.muted, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: THEME.text,
    marginBottom: 8
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  btn: { backgroundColor: THEME.accent, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#022c22', fontWeight: '700' },
  chip: {
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8
  },
  chipText: { color: THEME.text }
});
