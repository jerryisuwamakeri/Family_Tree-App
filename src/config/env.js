import {Platform} from 'react-native';

// __DEV__ is false in release builds, so a shipped APK can't fall back to a dev host.
const ENV = {
  dev: {
    // 10.0.2.2 is the emulator's route to the host's localhost.
    // On a physical device, swap in the machine's LAN IP.
    BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000',
  },
  prod: {
    BASE_URL: 'https://imammalikiabdullahifamilytree.com',
  },
};

const current = __DEV__ ? ENV.dev : ENV.prod;

export const BASE_URL = current.BASE_URL;
export const API_URL = `${BASE_URL}/api`;
export const IS_DEV = __DEV__;
