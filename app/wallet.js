import { useCallback, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { THEME, BUILTIN_ASSETS } from '../src/config/network';
import { t, initLang } from '../src/i18n';
import { loadSettings, loadCustomAssets, loadEthKeys, loadBtcKeys, loadTonAddress } from '../src/services/storage';
import { opxReopenWallet, opxGetBalance, opxGetAddress } from '../src/services/rpc';
import { getEthBalance, getErc20Balance } from '../src/services/eth';
import { getBtcBalance } from '../src/services/btc';
import { getTonBalance } from '../src/services/ton';
import { fetchPrices, usdValue } from '../src/services/coingecko';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export default function WalletHome() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const loadRef = useRef(null);

  const load = async () => {
    setErr('');
    await initLang();
    const settings = await loadSettings();
    const custom = await loadCustomAssets();
    const ethKeys = await loadEthKeys();
    const btcKeys = await loadBtcKeys();
    const tonAddr = await loadTonAddress();
    const assets = [...BUILTIN_ASSETS, ...custom];

    const priceIds = assets.map((a) => a.coingeckoId).filter(Boolean);
    const prices = await fetchPrices(priceIds);

    let opxBal = 0;
    let opxAddr = '';
    try {
      await opxReopenWallet();
      const b = await opxGetBalance();
      opxBal = b.balance;
      opxAddr = await opxGetAddress();
    } catch (e) {
      setErr('OPX: ' + e.message);
    }

    const out = [];
    let usdSum = 0;

    for (const asset of assets) {
      let balance = '0';
      let address = '';
      try {
        if (asset.type === 'opx') {
          balance = String(opxBal);
          address = opxAddr;
        } else if (asset.type === 'evm' && ethKeys.address) {
          balance = await getEthBalance(ethKeys.address);
          address = ethKeys.address;
        } else if (asset.type === 'erc20' && ethKeys.address && asset.contract) {
          balance = await getErc20Balance(ethKeys.address, asset.contract);
          address = ethKeys.address;
        } else if (asset.type === 'btc') {
          address = btcKeys.address || '';
          if (address) balance = await getBtcBalance(address);
        } else if (asset.type === 'ton') {
          address = tonAddr || '';
          if (address && address.startsWith('EQ')) {
            try {
              balance = await getTonBalance(address);
            } catch {
              balance = '0';
            }
          }
        }
      } catch (e) {
        balance = '—';
      }

      const num = parseFloat(balance) || 0;
      const usd = usdValue(num, asset.coingeckoId, prices);
      // OPX fixed $1 — never fetched from external APIs
      const usdFinal = asset.id === 'opx' ? num * 1 : usd;
      usdSum += usdFinal;

      out.push({
        ...asset,
        balance,
        address,
        usd: usdFinal
      });
    }

    setRows(out);
    setTotalUsd(usdSum);
    setLastUpdate(new Date());
    setLoading(false);
  };

  loadRef.current = load;

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // Auto-refresh prices & balances every 5 minutes
  useEffect(() => {
    const id = setInterval(() => {
      if (loadRef.current) loadRef.current();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.brand}>OPX Wallet</Text>
        <View style={styles.nav}>
          <Pressable onPress={() => router.push('/assets')}>
            <Text style={styles.navLink}>{t('assets')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/staking')}>
            <Text style={styles.navLink}>{t('staking')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/exchange')}>
            <Text style={[styles.navLink, styles.navAccent]}>{t('exchange')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={styles.navLink}>{t('settings')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('total_balance')}</Text>
        {loading ? (
          <ActivityIndicator color={THEME.accent} />
        ) : (
          <Text style={styles.totalValue}>${totalUsd.toFixed(2)}</Text>
        )}
        {lastUpdate && (
          <Text style={styles.updated}>
            {t('updated')}: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
        {!!err && <Text style={styles.err}>{err}</Text>}
      </View>

      {rows.map((a) => (
        <Pressable
          key={a.id}
          style={styles.assetRow}
          onPress={() =>
            router.push({
              pathname: '/assetDetail',
              params: {
                id: a.id,
                symbol: a.symbol,
                type: a.type,
                contract: a.contract || '',
                decimals: String(a.decimals || 18),
                balance: a.balance,
                address: a.address || ''
              }
            })
          }
        >
          <View>
            <Text style={styles.sym}>{a.symbol}</Text>
            <Text style={styles.name}>{a.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bal}>{a.balance === '—' ? '—' : Number(a.balance).toFixed(2)}</Text>
            <Text style={styles.usd}>${(a.usd || 0).toFixed(2)}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  header: { marginBottom: 16 },
  brand: { fontSize: 24, fontWeight: '900', color: THEME.accent },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  navLink: { color: THEME.muted, fontWeight: '600' },
  navAccent: { color: THEME.accent },
  totalCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 20,
    marginBottom: 16
  },
  totalLabel: { color: THEME.muted, fontSize: 12, textTransform: 'uppercase' },
  totalValue: { color: THEME.accent, fontSize: 32, fontWeight: '800', marginTop: 4 },
  updated: { color: THEME.muted, fontSize: 11, marginTop: 6 },
  err: { color: THEME.danger, fontSize: 12, marginTop: 8 },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginBottom: 10
  },
  sym: { color: THEME.text, fontWeight: '700', fontSize: 16 },
  name: { color: THEME.muted, fontSize: 12 },
  bal: { color: THEME.text, fontWeight: '600' },
  usd: { color: THEME.muted, fontSize: 12 }
});
