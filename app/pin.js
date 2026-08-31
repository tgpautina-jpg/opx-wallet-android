import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../src/config/network';
import { loadPin, savePin } from '../src/services/storage';

export default function PinScreen() {
  const router = useRouter();
  const [existing, setExisting] = useState(null); // null=loading, ''=no pin, '...'=pin
  const [value, setValue] = useState('');
  const [first, setFirst] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const p = await loadPin();
      setExisting(p || '');
    })();
  }, []);

  if (existing === null) {
    return <View style={styles.root} />;
  }

  const onSubmit = async () => {
    if (existing) {
      // режим проверки
      if (value === existing) {
        router.replace('/wallet');
      } else {
        setErr('Неверный PIN');
        setValue('');
      }
    } else {
      // режим установки
      if (value.length < 4) {
        setErr('Минимум 4 цифры');
        return;
      }
      if (!first) {
        setFirst(value);
        setValue('');
        setErr('');
      } else {
        if (value === first) {
          await savePin(value);
          router.replace('/wallet');
        } else {
          setErr('PIN не совпал');
          setValue('');
          setFirst('');
        }
      }
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>OPX</Text>
      <Text style={styles.title}>{existing ? 'Введите PIN' : 'Придумайте PIN'}</Text>
      <Text style={styles.sub}>
        {existing
          ? 'PIN защищает кошелёк от посторонних'
          : first
            ? 'Повторите PIN для подтверждения'
            : 'Минимум 4 цифры'}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => setValue(t.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        secureTextEntry
        placeholder="••••"
        placeholderTextColor={THEME.muted}
        maxLength={6}
        autoFocus
      />
      {!!err && <Text style={styles.err}>{err}</Text>}
      <Pressable style={styles.btn} onPress={onSubmit}>
        <Text style={styles.btnText}>{first ? 'Подтвердить' : 'ОК'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
    padding: 24,
    justifyContent: 'center'
  },
  logo: { fontSize: 48, fontWeight: '900', color: THEME.accent, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: THEME.text, textAlign: 'center', marginTop: 8 },
  sub: { color: THEME.muted, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  input: {
    backgroundColor: THEME.input,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: THEME.text,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16
  },
  err: { color: THEME.danger, textAlign: 'center', marginBottom: 12 },
  btn: {
    backgroundColor: THEME.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  btnText: { color: '#022c22', fontWeight: '800', fontSize: 16 }
});
