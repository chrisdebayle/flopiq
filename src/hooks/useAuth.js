import { useState, useCallback } from 'react';

const LS_KEY_USER = 'flopiq_user';

function loadUser() {
  try {
    const data = localStorage.getItem(LS_KEY_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(LS_KEY_USER, JSON.stringify(user));
}

function generateId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function useAuth() {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((displayName) => {
    // Check if returning user with this name exists
    const existing = loadUser();
    if (existing && existing.displayName === displayName) {
      setUser(existing);
      return existing;
    }
    // New user or different name
    const newUser = {
      id: existing?.id || generateId(),
      displayName: displayName.trim(),
      createdAt: existing?.createdAt || Date.now(),
      lastLogin: Date.now(),
    };
    saveUser(newUser);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Don't delete user data — just clear the session
  }, []);

  return { user, login, logout, isLoggedIn: !!user };
}
