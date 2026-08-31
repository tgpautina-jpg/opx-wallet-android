import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { THEME, OPX } from '../src/config/network';
import { t } from '../src/i18n';
import { loadSettings } from '../src/services/storage';
import { opxEnsureWallet, opxTransfer, toAtomic } from '../src/services/rpc';

const TERMS = [
  { months: 1, apy: OPX.stakingApy[1] },
  { months: 3, apy: OPX.stakingApy[3] },
  { months: 6, apy: OPX.stakingApy[6] }
];

export default function StakingScreen() {
  const [term, setTerm] = useState(TERMS[0]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const stake = async () => {
    const settings = await loadSettings();
    const stakingAddr = OPX.stakingAddress || settings.stakingAddress;
    if (!stakingAddr) {
      Alert.alert(
        t('error'),
        'Staking address not configured. Set OPX.stakingAddress in config or ask network operator.'
      );
      return;
    }
    if (!amount) {
      Alert.alert(t('error'), 'Enter amount');
      return;
    }
    setBusy(true);
    try {
      const auth = settings.opxUser ? { user: settings.opxUser, pass: settings.opxPass } : null;
      await opxEnsureWallet(settings.opxRpc, auth, settings.opxWalletFile, settings.opxWalletPassword);
      const r = await opxTransfer(settings.opxRpc, auth, stakingAddr, toAtomic(amount));
      Alert.alert('OK', `Staked ${amount} OPX for ${term.months}m @ ${term.apy}%\n${r.tx_hash || ''}`);
      setAmount('');
    } catch (e) {
      Alert.alert(t('error'), e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('staking_title')}</Text>
      <Text style={styles.hint}>APY by term. Transfer goes to staking address (operator config).</Text>

      <View style={styles.terms}>
        {TERMS.map((x) => (
          <Pressable
            key={x.months}
            style={[styles.term, term.months === x.months && styles.termOn]}
            onPress={() => setTerm(x)}
          >
            <Text style={styles.termM}>{x.months} {t('months')}</Text>
            <Text style={styles.termA}>{x.apy}% {t('apy')}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('amount') + ' OPX'}
        placeholderTextColor={THEME.muted}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      <Pressable style={[styles.btn, busy && { opacity: 0.5 }]} onPress={stake} disabled={busy}>
        <Text style={styles.btnText}>{t('stake')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: THEME.text },
  hint: { color: THEME.muted, fontSize: 12, marginVertical: 12 },
  terms: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  term: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  termOn: { borderColor: THEME.accent, backgroundColor: THEME.card },
  termM: { color: THEME.text, fontWeight: '700' },
  termA: { color: THEME.accent, marginTop: 4 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: THEME.text,
    marginBottom: 12
  },
  btn: { backgroundColor: THEME.accent, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#022c22', fontWeight: '800' }
});
