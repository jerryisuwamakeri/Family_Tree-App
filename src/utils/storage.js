import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@familytree_token',
  USER: '@familytree_user',
};

export const storage = {
  async getToken() {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },
  async setToken(token) {
    return AsyncStorage.setItem(KEYS.TOKEN, token);
  },
  async removeToken() {
    return AsyncStorage.removeItem(KEYS.TOKEN);
  },

  async getUser() {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  async setUser(user) {
    return AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  async removeUser() {
    return AsyncStorage.removeItem(KEYS.USER);
  },

  async clearAll() {
    return AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
  },
};
