import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/users/me/');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) fetchUser();
    else setLoading(false);
  }, [fetchUser]);

  /** login بالبريد أو اسم المستخدم + خيار تذكرني */
  const login = async (identifier, password, remember = true) => {
    const res = await api.post('/token/', { username: identifier, password });
    const store = remember ? localStorage : sessionStorage;
    store.setItem('access_token', res.data.access);
    store.setItem('refresh_token', res.data.refresh);
    await fetchUser();
    return true;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);