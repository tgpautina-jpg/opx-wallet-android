import { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../src/config/network';
import { initLang, t, setLang } from '../src/i18n';
import { isOnboarded, loadPin } from '../src/services/storage';
import { createNewWallet, restoreFromMnemonic } from '../src/utils/walletBootstrap';

export default function Onboarding() {
  const router = useRouter();
  const [mode, setMode] = useState('home'); // home | seed | restore
  const [mnemonic, setMnemonic] = useState('');
  const [restoreText, setRestoreText] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      await initLang();
      if (await isOnboarded()) {
        const pin = await loadPin();
        router.replace(pin ? '/pin' : '/wallet');
        return;
      }
      setBusy(false);
    })();
  }, []);

  const onCreate = async () => {
    setBusy(true);
    try {
      const { mnemonic: m } = await createNewWallet();
      setMnemonic(m);
      setMode('seed');
    } catch (e) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      await restoreFromMnemonic(restoreText);
      router.replace('/wallet');
    } catch (e) {
      Alert.alert(t('error'), e.message || 'Invalid seed');
    } finally {
      setBusy(false);
    }
  };

  if (busy && mode === 'home') {
    return (
      <View style={[styles.root, { justifyContent: 'center' }]}>
        <ActivityIndicator color={THEME.accent} size="large" />
      </View>
    );
  }

  if (mode === 'seed') {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Text style={styles.logo}>OPX</Text>
        <Text style={styles.title}>{t('seed_title')}</Text>
        <Text style={styles.warn}>{t('seed_warn')}</Text>
        <View style={styles.seedBox}>
          <Text selectable style={styles.seed}>{mnemonic}</Text>
        </View>
        <Pressable
          style={styles.btn}
          onPress={() => router.replace('/pin')}
        >
          <Text style={styles.btnText}>{t('seed_confirm')}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (mode === 'restore') {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Text style={styles.title}>{t('restore_wallet')}</Text>
        <TextInput
          style={[styles.input, { minHeight: 100 }]}
          multiline
          placeholder="word1 word2 ..."
          placeholderTextColor={THEME.muted}
          value={restoreText}
          onChangeText={setRestoreText}
          autoCapitalize="none"
        />
        <Pressable style={styles.btn} onPress={onRestore} disabled={busy}>
          <Text style={styles.btnText}>{t('continue')}</Text>
        </Pressable>
        <Pressable onPress={() => setMode('home')}>
          <Text style={styles.link}>← Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>OPX</Text>
      <Text style={styles.sub}>{t('app_name')} v3</Text>
      <Pressable style={styles.btn} onPress={onCreate}>
        <Text style={styles.btnText}>{t('create_wallet')}</Text>
      </Pressable>
      <Pressable style={styles.btnGhost} onPress={() => setMode('restore')}>
        <Text style={styles.btnGhostText}>{t('restore_wallet')}</Text>
      </Pressable>
      <View style={styles.langRow}>
        <Pressable onPress={() => setLang('ru')}><Text style={styles.link}>RU</Text></Pressable>
        <Pressable onPress={() => setLang('en')}><Text style={styles.link}>EN</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: THEME.bg,
    padding: 24,
    justifyContent: 'center'
  },
  logo: { fontSize: 48, fontWeight: '900', color: THEME.accent, textAlign: 'center' },
  sub: { color: THEME.muted, textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: THEME.text, marginBottom: 12 },
  warn: { color: THEME.warning, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  seedBox: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 20
  },
  seed: { color: THEME.text, fontSize: 16, lineHeight: 26 },
  btn: {
    backgroundColor: THEME.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  btnText: { color: '#022c22', fontWeight: '800', fontSize: 16 },
  btnGhost: {
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  btnGhostText: { color: THEME.text, fontWeight: '600' },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: THEME.text,
    marginBottom: 12
  },
  link: { color: THEME.accent, marginTop: 16, textAlign: 'center' },
  langRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 32 }
});
