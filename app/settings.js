import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../src/config/network';
import { t, setLang, getLang } from '../src/i18n';
import {
  loadSettings, saveSettings, loadSeed, wipeAll, saveBtcKeys, loadBtcKeys, saveTonAddress, loadTonAddress
} from '../src/services/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [seed, setSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [btcAddr, setBtcAddr] = useState('');
  const [tonAddr, setTonAddr] = useState('');

  useEffect(() => {
    (async () => {
      setS(await loadSettings());
      setBtcAddr((await loadBtcKeys()).address || '');
      setTonAddr((await loadTonAddress()) || '');
    })();
  }, []);

  if (!s) return <View style={styles.root} />;

  const save = async () => {
    await saveSettings(s);
    await saveBtcKeys(btcAddr.trim(), '');
    await saveTonAddress(tonAddr.trim());
    Alert.alert('OK', t('save'));
  };

  const viewSeed = async () => {
    const m = await loadSeed();
    setSeed(m || '');
    setShowSeed(true);
  };

  const reset = () => {
    Alert.alert(t('logout'), 'Delete all local keys?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          await wipeAll();
          router.replace('/');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{t('settings')}</Text>

      <Text style={styles.label}>{t('language')}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.chip}
          onPress={async () => {
            await setLang('ru');
            setS({ ...s });
          }}
        >
          <Text style={styles.chipText}>RU</Text>
        </Pressable>
        <Pressable
          style={styles.chip}
          onPress={async () => {
            await setLang('en');
            setS({ ...s });
          }}
        >
          <Text style={styles.chipText}>EN</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{t('opx_node')}</Text>
      <TextInput
        style={styles.input}
        value={s.opxRpc}
        onChangeText={(v) => setS({ ...s, opxRpc: v })}
        autoCapitalize="none"
        placeholderTextColor={THEME.muted}
      />

      <Text style={styles.label}>BTC address (watch / receive)</Text>
      <TextInput
        style={styles.input}
        value={btcAddr}
        onChangeText={setBtcAddr}
        autoCapitalize="none"
        placeholder="bc1... or 1..."
        placeholderTextColor={THEME.muted}
      />

      <Text style={styles.label}>TON address</Text>
      <TextInput
        style={styles.input}
        value={tonAddr}
        onChangeText={setTonAddr}
        autoCapitalize="none"
        placeholder="EQ..."
        placeholderTextColor={THEME.muted}
      />

      <Pressable style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>{t('save')}</Text>
      </Pressable>

      <Pressable style={styles.btnGhost} onPress={viewSeed}>
        <Text style={styles.btnGhostText}>{t('view_seed')}</Text>
      </Pressable>
      {showSeed && (
        <View style={styles.seedBox}>
          <Text selectable style={styles.seed}>{seed}</Text>
        </View>
      )}

      <Pressable style={[styles.btnGhost, { borderColor: THEME.danger }]} onPress={reset}>
        <Text style={{ color: THEME.danger, fontWeight: '700' }}>{t('logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  title: { fontSize: 22, fontWeight: '800', color: THEME.text, marginBottom: 16 },
  label: { color: THEME.muted, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: THEME.text,
    marginBottom: 12
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  chipText: { color: THEME.text },
  btn: { backgroundColor: THEME.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#022c22', fontWeight: '800' },
  btnGhost: { borderWidth: 1, borderColor: THEME.border, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnGhostText: { color: THEME.muted, fontWeight: '600' },
  seedBox: { backgroundColor: THEME.card, padding: 12, borderRadius: 10, marginBottom: 12 },
  seed: { color: THEME.text, lineHeight: 22 }
});
