import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthDrawerContext = createContext(null);

const noop = () => {};

const FALLBACK = {
  open: false,
  mode: 'login',
  openAuthDrawer: noop,
  closeAuthDrawer: noop,
  switchMode: noop,
  toggleMode: noop,
};

export const AuthDrawerProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, mode: 'login' });

  const openAuthDrawer = useCallback((mode = 'login') => {
    setState({ open: true, mode: mode === 'register' ? 'register' : 'login' });
  }, []);

  const closeAuthDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const switchMode = useCallback((mode) => {
    setState((prev) => ({ ...prev, mode: mode === 'register' ? 'register' : 'login' }));
  }, []);

  const toggleMode = useCallback(() => {
    setState((prev) => ({ ...prev, mode: prev.mode === 'login' ? 'register' : 'login' }));
  }, []);

  const value = useMemo(
    () => ({
      open: state.open,
      mode: state.mode,
      openAuthDrawer,
      closeAuthDrawer,
      switchMode,
      toggleMode,
    }),
    [state, openAuthDrawer, closeAuthDrawer, switchMode, toggleMode]
  );

  return <AuthDrawerContext.Provider value={value}>{children}</AuthDrawerContext.Provider>;
};

export const useAuthDrawer = () => {
  const ctx = useContext(AuthDrawerContext);
  return ctx || FALLBACK;
};

export default AuthDrawerContext;
