import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../src/config/network';
import { loadLang, setLang, t } from '../src/i18n';

export default function LangScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = await AsyncStorage.getItem('opx_lang');
      await loadLang();
      if (existing) {
        router.replace('/wallet');
      } else {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return <View style={styles.root} />;
  }

  const choose = async (l) => {
    await setLang(l);
    router.replace('/wallet');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>OPX</Text>
      <Text style={styles.sub}>{t('choose_lang')}</Text>
      <Pressable style={styles.btn} onPress={() => choose('en')}>
        <Text style={styles.btnText}>English</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => choose('ru')}>
        <Text style={styles.btnText}>Русский</Text>
      </Pressable>
      <Text style={styles.hint}>{t('disclaimer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  logo: { fontSize: 42, fontWeight: '800', color: THEME.accent, marginBottom: 8 },
  sub: { color: THEME.muted, marginBottom: 24 },
  btn: {
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginVertical: 6,
    minWidth: 200,
    alignItems: 'center'
  },
  btnText: { color: '#022c22', fontWeight: '700' },
  hint: { color: THEME.muted, fontSize: 12, marginTop: 24, textAlign: 'center' }
});
