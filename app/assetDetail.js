import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { THEME } from '../src/config/network';
import { t } from '../src/i18n';
import { loadSettings, loadEthKeys } from '../src/services/storage';
import { opxEnsureWallet, opxTransfer, opxGetTransfers, toAtomic, fromAtomic } from '../src/services/rpc';
import { sendEth, sendErc20 } from '../src/services/eth';
import { getBtcHistory } from '../src/services/btc';
import { getTonHistory } from '../src/services/ton';

export default function AssetDetail() {
  const params = useLocalSearchParams();
  const symbol = params.symbol || '';
  const type = params.type || '';
  const contract = params.contract || '';
  const decimals = parseInt(params.decimals || '18', 10);
  const address = params.address || '';
  const balance = params.balance || '0';

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    if (!address) return;
    await Clipboard.setStringAsync(address);
    Alert.alert(t('copied'));
  };

  const loadHistory = async () => {
    try {
      if (type === 'opx') {
        const settings = await loadSettings();
        const auth = settings.opxUser ? { user: settings.opxUser, pass: settings.opxPass } : null;
        await opxEnsureWallet(settings.opxRpc, auth, settings.opxWalletFile, settings.opxWalletPassword);
        const tr = await opxGetTransfers(settings.opxRpc, auth);
        const items = [];
        (tr.in || []).forEach((x) => items.push({ dir: 'in', amount: fromAtomic(x.amount), hash: x.txid || x.tx_hash }));
        (tr.out || []).forEach((x) => items.push({ dir: 'out', amount: fromAtomic(x.amount), hash: x.txid || x.tx_hash }));
        setHistory(items.slice(0, 30));
      } else if (type === 'btc' && address) {
        setHistory(await getBtcHistory(address));
      } else if (type === 'ton' && address) {
        setHistory(await getTonHistory(address));
      } else {
        setHistory([]);
      }
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  const onSend = async () => {
    if (!to || !amount) {
      Alert.alert(t('error'), 'Fill address and amount');
      return;
    }
    setBusy(true);
    try {
      if (type === 'opx') {
        const settings = await loadSettings();
        const auth = settings.opxUser ? { user: settings.opxUser, pass: settings.opxPass } : null;
        await opxEnsureWallet(settings.opxRpc, auth, settings.opxWalletFile, settings.opxWalletPassword);
        const r = await opxTransfer(settings.opxRpc, auth, to.trim(), toAtomic(amount));
        Alert.alert('OK', r.tx_hash || 'sent');
      } else if (type === 'evm') {
        const { privateKey } = await loadEthKeys();
        const hash = await sendEth(privateKey, to.trim(), amount);
        Alert.alert('OK', hash);
      } else if (type === 'erc20') {
        const { privateKey } = await loadEthKeys();
        const hash = await sendErc20(privateKey, contract, to.trim(), amount, decimals);
        Alert.alert('OK', hash);
      } else if (type === 'btc' || type === 'ton') {
        Alert.alert(t('error'), `${symbol} send — next release (balance/receive OK)`);
      }
      setTo('');
      setAmount('');
    } catch (e) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{symbol}</Text>
      <Text style={styles.bal}>{balance}</Text>

      <Text style={styles.section}>{t('receive')}</Text>
      {!!address && (
        <View style={styles.qrWrap}>
          <QRCode value={address} size={160} />
        </View>
      )}
      <Text selectable style={styles.addr}>{address || '—'}</Text>
      <Pressable style={styles.btnGhost} onPress={copy}>
        <Text style={styles.btnGhostText}>{t('copy')}</Text>
      </Pressable>

      <Text style={styles.section}>{t('send')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('to')}
        placeholderTextColor={THEME.muted}
        value={to}
        onChangeText={setTo}
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
      <Pressable style={[styles.btn, busy && { opacity: 0.5 }]} onPress={onSend} disabled={busy}>
        <Text style={styles.btnText}>{t('confirm')}</Text>
      </Pressable>

      <Pressable style={styles.btnGhost} onPress={loadHistory}>
        <Text style={styles.btnGhostText}>{t('history')}</Text>
      </Pressable>
      {history.length === 0 ? (
        <Text style={styles.muted}>{t('no_history')}</Text>
      ) : (
        history.map((h, i) => (
          <View key={i} style={styles.tx}>
            <Text style={{ color: h.dir === 'in' ? THEME.accent : THEME.warning }}>
              {h.dir === 'in' ? '+' : '−'}{h.amount ?? h.total ?? ''}
            </Text>
            <Text style={styles.muted}>{(h.hash || '').slice(0, 16)}…</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  title: { fontSize: 22, fontWeight: '800', color: THEME.text },
  bal: { fontSize: 28, color: THEME.accent, fontWeight: '700', marginBottom: 16 },
  section: { color: THEME.muted, marginTop: 12, marginBottom: 8, fontWeight: '600' },
  qrWrap: { alignSelf: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  addr: { color: THEME.text, fontSize: 12, marginBottom: 8 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: THEME.text,
    marginBottom: 10
  },
  btn: { backgroundColor: THEME.accent, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#022c22', fontWeight: '800' },
  btnGhost: { borderWidth: 1, borderColor: THEME.border, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnGhostText: { color: THEME.muted, fontWeight: '600' },
  muted: { color: THEME.muted, fontSize: 12 },
  tx: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: THEME.border }
});
