'use client';

import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const UIContext = createContext({
  theme: 'system',
  sidebarOpen: false,
  userMenuOpen: false,
  mobileMenuOpen: false,
  notifications: [],
  modals: {},
  setTheme: () => {},
  toggleTheme: () => {},
  toggleSidebar: () => {},
  setSidebarOpen: () => {},
  toggleUserMenu: () => {},
  setUserMenuOpen: () => {},
  toggleMobileMenu: () => {},
  setMobileMenuOpen: () => {},
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  openModal: () => {},
  closeModal: () => {},
  toggleModal: () => {},
  reset: () => {},
});

export function UIProvider({ children }) {
  // Initialize theme from localStorage (runs once on mount)
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  };

  const [theme, setThemeState] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [modals, setModals] = useState({});

  // Theme actions
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const newTheme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      return newTheme;
    });
  }, []);

  // Sidebar actions
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // User menu actions
  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  // Mobile menu actions
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  // Notification actions
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [...prev, { ...notification, id: Date.now() }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Modal actions
  const openModal = useCallback((modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const toggleModal = useCallback((modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  // Reset UI state (preserve theme)
  const reset = useCallback(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setNotifications([]);
    setModals({});
  }, []);

  const value = useMemo(() => ({
    theme,
    sidebarOpen,
    userMenuOpen,
    mobileMenuOpen,
    notifications,
    modals,
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarOpen,
    toggleUserMenu,
    setUserMenuOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    toggleModal,
    reset,
  }), [
    theme,
    sidebarOpen,
    userMenuOpen,
    mobileMenuOpen,
    notifications,
    modals,
    setTheme,
    toggleTheme,
    toggleSidebar,
    toggleUserMenu,
    toggleMobileMenu,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    toggleModal,
    reset,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
