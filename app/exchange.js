import { useRouter, Stack } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';
import { THEME } from '../src/config/network';
import { t } from '../src/i18n';

const EXCHANGE_URL = 'https://opxnetwork.duckdns.org/exchange/';

/**
 * In-app exchange: WebView → site exchange page.
 * Back button returns to wallet without leaving the app.
 */
export default function ExchangeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.bar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/wallet');
          }}
          hitSlop={12}
        >
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('exchange')}</Text>
        <View style={{ width: 64 }} />
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator color={THEME.accent} size="large" />
        </View>
      )}

      <WebView
        source={{ uri: EXCHANGE_URL }}
        style={styles.web}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        originWhitelist={['https://*', 'http://*']}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border
  },
  backBtn: { minWidth: 64 },
  backText: { color: THEME.accent, fontWeight: '700', fontSize: 16 },
  title: { color: THEME.text, fontWeight: '700', fontSize: 16 },
  web: { flex: 1, backgroundColor: THEME.bg },
  loader: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center'
  }
});
