import React, {createContext, useContext, useEffect, useReducer, useRef, useCallback} from 'react';
import {AppState, Alert} from 'react-native';
import {authApi} from '../api/auth';
import {storage} from '../utils/storage';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'CLEAR_AUTH':
      return {...initialState, loading: false};
    case 'SET_LOADING':
      return {...state, loading: action.value};
    case 'UPDATE_USER':
      return {...state, user: action.user};
    default:
      return state;
  }
}

export function AuthProvider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const doLogout = useCallback(async () => {
    clearTimer();
    try { await authApi.logout(); } catch {}
    await storage.clearAll();
    dispatch({type: 'CLEAR_AUTH'});
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      Alert.alert(
        'Session Expired',
        'You have been logged out due to 30 minutes of inactivity.',
        [{text: 'OK', onPress: doLogout}],
      );
    }, INACTIVITY_TIMEOUT);
  }, [doLogout]);

  // Start/stop timer based on auth state
  useEffect(() => {
    if (state.isAuthenticated) {
      resetTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [state.isAuthenticated, resetTimer]);

  // Pause timer when app goes to background; resume + check elapsed on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        backgroundTimeRef.current = Date.now();
        clearTimer();
      } else if (nextState === 'active' && appStateRef.current.match(/inactive|background/)) {
        const elapsed = Date.now() - (backgroundTimeRef.current || 0);
        if (state.isAuthenticated && elapsed >= INACTIVITY_TIMEOUT) {
          doLogout();
        } else if (state.isAuthenticated) {
          resetTimer();
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [state.isAuthenticated, doLogout, resetTimer]);

  // Restore session on startup
  useEffect(() => {
    (async () => {
      try {
        const [token, user] = await Promise.all([storage.getToken(), storage.getUser()]);
        if (token && user) {
          dispatch({type: 'SET_AUTH', user, token});
        } else {
          dispatch({type: 'CLEAR_AUTH'});
        }
      } catch {
        dispatch({type: 'CLEAR_AUTH'});
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    const {token, user} = data;
    await storage.setToken(token);
    await storage.setUser(user);
    dispatch({type: 'SET_AUTH', user, token});
  };

  const register = async formData => {
    const data = await authApi.register(formData);
    // New accounts are pending admin approval and come back with token: null --
    // only treat this as a real login if a token was actually issued.
    if (data.token) {
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      dispatch({type: 'SET_AUTH', user: data.user, token: data.token});
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    await storage.clearAll();
    dispatch({type: 'CLEAR_AUTH'});
  };

  const refreshMe = async () => {
    try {
      const user = await authApi.me();
      await storage.setUser(user);
      dispatch({type: 'UPDATE_USER', user});
    } catch {}
  };

  return (
    <AuthContext.Provider value={{...state, login, register, logout, refreshMe, resetTimer}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
