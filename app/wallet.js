import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, RefreshControl, Linking
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { THEME, OPX_NETWORK } from '../src/config/network';
import { t, loadLang } from '../src/i18n';
import { loadSettings, saveWalletMeta, loadWalletMeta } from '../src/services/storage';
import {
  getBalance, getAddress, getTransfers, transfer,
  fromAtomic, toAtomic
} from '../src/services/rpc';

export default function WalletScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [history, setHistory] = useState([]);
  const [dest, setDest] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    const s = await loadSettings();
    setSettings(s);
    await loadLang();
    if (!s.walletRpcUrl || s.offlineOnly) {
      setStatus(t('offline'));
      const meta = await loadWalletMeta();
      if (meta?.address) setAddress(meta.address);
      return;
    }
    try {
      const bal = await getBalance(s.walletRpcUrl);
      setBalance(bal);
      const addr = await getAddress(s.walletRpcUrl);
      const ad = addr.address || addr.addresses?.[0]?.address || '';
      setAddress(ad);
      await saveWalletMeta({ address: ad, updated: Date.now() });
      const tr = await getTransfers(s.walletRpcUrl);
      const items = [];
      (tr.in || []).forEach(x => items.push({ ...x, dir: 'in' }));
      (tr.out || []).forEach(x => items.push({ ...x, dir: 'out' }));
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setHistory(items.slice(0, 30));
      setStatus('OK');
    } catch (e) {
      setStatus(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const doSend = async () => {
    if (!dest.trim() || !amount.trim()) {
      Alert.alert('Error', t('fill_fields'));
      return;
    }
    try {
      const atomic = toAtomic(amount);
      await transfer(settings.walletRpcUrl, [{ address: dest.trim(), amount: atomic }]);
      setDest('');
      setAmount('');
      Alert.alert('OK', 'Sent');
      await refresh();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const copyAddr = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      Alert.alert('OK', t('copy'));
    }
  };

  const openExchange = () => {
    if (OPX_NETWORK.exchangeUrl) {
      Linking.openURL(OPX_NETWORK.exchangeUrl);
    } else {
      Alert.alert(t('exchange'), t('exchange_coming_soon'));
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.accent} />}
    >
      <View style={styles.row}>
        <Text style={styles.title}>OPX</Text>
        <Pressable onPress={() => router.push('/settings')}>
          <Text style={styles.link}>{t('settings')}</Text>
        </Pressable>
      </View>

      <Text style={styles.muted}>{status}</Text>

      {/* Balance */}
      <View style={styles.card}>
        <Text style={styles.label}>{t('balance')}</Text>
        <Text style={styles.balance}>
          {balance ? `${fromAtomic(balance.balance).toFixed(4)} OPX` : '—'}
        </Text>
        {balance && (
          <Text style={styles.muted}>
            unlocked: {fromAtomic(balance.unlocked_balance).toFixed(4)}
          </Text>
        )}
      </View>

      {/* Exchange button */}
      <Pressable style={styles.exchangeCard} onPress={openExchange}>
        <Text style={styles.exchangeIcon}>⇄</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.exchangeTitle}>{t('exchange')}</Text>
          <Text style={styles.exchangeHint}>{t('exchange_hint')}</Text>
        </View>
        <Text style={styles.exchangeArrow}>›</Text>
      </Pressable>

      {/* Receive */}
      <View style={styles.card}>
        <Text style={styles.label}>{t('receive')}</Text>
        <Text selectable style={styles.address}>{address || '—'}</Text>
        {!!address && (
          <View style={{ alignItems: 'center', marginVertical: 12, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
            <QRCode value={address} size={160} backgroundColor="#fff" color="#000" />
          </View>
        )}
        <Pressable style={styles.btnGhost} onPress={copyAddr}>
          <Text style={styles.btnGhostText}>{t('copy')}</Text>
        </Pressable>
      </View>

      {/* Send */}
      <View style={styles.card}>
        <Text style={styles.label}>{t('send')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('dest')}
          placeholderTextColor={THEME.muted}
          value={dest}
          onChangeText={setDest}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder={t('amount')}
          placeholderTextColor={THEME.muted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Pressable style={styles.btn} onPress={doSend}>
          <Text style={styles.btnText}>{t('send')}</Text>
        </Pressable>
      </View>

      {/* History */}
      <View style={styles.card}>
        <Text style={styles.label}>{t('history')}</Text>
        {history.length === 0 ? (
          <Text style={styles.muted}>{t('no_tx')}</Text>
        ) : (
          history.map((tx, i) => (
            <View key={i} style={styles.tx}>
              <Text style={{ color: tx.dir === 'in' ? THEME.accent : '#f59e0b' }}>
                {tx.dir === 'in' ? '+' : '−'}{fromAtomic(tx.amount).toFixed(4)} OPX
              </Text>
              <Text style={styles.muted}>
                {(tx.txid || tx.tx_hash || '').slice(0, 14)}…
              </Text>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.muted, { marginBottom: 40 }]}>
        {OPX_NETWORK.name} · prefix {OPX_NETWORK.addressPrefix}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: THEME.accent },
  link: { color: THEME.accent, fontWeight: '600' },
  muted: { color: THEME.muted, fontSize: 12 },
  card: {
    backgroundColor: THEME.card,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  label: { color: THEME.muted, fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  balance: { color: THEME.accent, fontSize: 28, fontWeight: '700' },
  address: { color: THEME.text, fontSize: 12, fontFamily: 'monospace' },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: THEME.text,
    marginBottom: 10
  },
  btn: {
    backgroundColor: THEME.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  btnText: { color: '#022c22', fontWeight: '700' },
  btnGhost: {
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  btnGhostText: { color: THEME.muted, fontWeight: '600' },
  tx: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: THEME.border },
  // Exchange card
  exchangeCard: {
    backgroundColor: THEME.card,
    borderColor: THEME.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  exchangeIcon: { fontSize: 28, color: THEME.accent, marginRight: 12 },
  exchangeTitle: { color: THEME.text, fontSize: 16, fontWeight: '700' },
  exchangeHint: { color: THEME.muted, fontSize: 12, marginTop: 2 },
  exchangeArrow: { color: THEME.muted, fontSize: 24 }
});
