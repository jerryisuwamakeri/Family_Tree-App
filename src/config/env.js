import {Platform} from 'react-native';
import Constants from 'expo-constants';

// Expo Go / dev-client embed the packager's LAN address in the manifest, e.g.
// "192.168.1.23:8081" -- use that so a phone on the same network can reach this
// machine. Fall back to the emulator/simulator loopback aliases when it's
// unavailable (e.g. running in an emulator instead of a physical device).
function getDevHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

// Some networks (e.g. mobile hotspots with AP/client isolation) block a phone
// from reaching this machine directly even on the same Wi-Fi. When that
// happens, run the backend behind a tunnel too and point at it via a local
// .env (EXPO_PUBLIC_* vars are inlined by Metro; .env is gitignored, so this
// never needs a source edit or a commit).
const DEV_BASE_URL_OVERRIDE = process.env.EXPO_PUBLIC_DEV_API_BASE_URL || null;

// __DEV__ is false in release builds, so a shipped APK can't fall back to a dev host.
const ENV = {
  dev: {
    BASE_URL: DEV_BASE_URL_OVERRIDE || `http://${getDevHost()}:8000`,
  },
  prod: {
    BASE_URL: 'https://imammalikiabdullahifamilytree.com',
  },
};

const current = __DEV__ ? ENV.dev : ENV.prod;

export const BASE_URL = current.BASE_URL;
export const API_URL = `${BASE_URL}/api`;
export const IS_DEV = __DEV__;
