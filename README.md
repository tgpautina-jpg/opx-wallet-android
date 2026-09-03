# OPX Cold Wallet (Mobile) — MVP

React Native (Expo) companion / cold-oriented wallet UI for **OPX Network**.

## Important (read this)

OPX is a **CryptoNote fork** with its own network ID, genesis and address prefixes.  
Stock `monero-ts` / Monero WASM **cannot** spend on OPX without rebuilding native/WASM code from [OPX sources](https://github.com/tgpautina-jpg/OPX).

**This MVP:**

- Stores **settings** and **address metadata** on device (SecureStore / AsyncStorage).
- Talks to **your** `opx-wallet-rpc` (LAN/VPN/localhost via adb reverse) for create/open/restore/send/balance.
- Default **offlineOnly = true** — no remote calls until you set a wallet-rpc URL and disable offline mode.
- Does **not** invent cryptography; uses OPX wallet-rpc JSON-RPC.
- Remote node `178.236.247.121` is **optional** and only for daemon ops you enable.

Positioning: **MVP cold wallet UI for OPX node operators**, no security guarantees.

## Network params (from OPX README)

| Param | Value |
|-------|-------|
| Network ID | `b0639745c560d80ecd1fbee1147dc8fe` |
| P2P | 28981 |
| Daemon RPC | 28982 |
| Wallet RPC | 28984 |
| Address prefix | 30 |

## Install

```bash
cd opx-wallet-mobile
npm install
npx expo start
```

## Point mobile at wallet-rpc

### Android emulator → host wallet-rpc

```bash
adb reverse tcp:28984 tcp:28984
```

In app Settings set:

`http://127.0.0.1:28984/json_rpc`

### Physical device

Use your PC LAN IP (same Wi‑Fi) or VPN, e.g. `http://192.168.1.10:28984/json_rpc`.  
Prefer VPN / SSH tunnel; do not expose wallet-rpc to the public internet.

## Build APK / IPA (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
# set extra.eas.projectId in app.json
eas build -p android --profile preview   # APK
eas build -p ios --profile preview       # IPA (needs Apple account)
```

Local Android APK without EAS (dev client):

```bash
npx expo prebuild
npx expo run:android
```

## Roadmap to true on-device cold keys

1. Build `opx-wallet-rpc` / libwallet from OPX repo for Android/iOS (JNI / WASM).
2. Or fork `monero-ts` and compile WASM against OPX `cryptonote_config.h` (network id, prefixes, ports).
3. Replace RPC open/create with local `createWalletFull` / `createWalletKeys` for OPX.
4. Keep broadcast-only path to a remote **daemon** (never send spend key).

## Theme

- Background `#0B1220`
- Accent `#10B981`
