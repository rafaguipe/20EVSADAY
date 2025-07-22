import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const themes = {
  dark: {
    background: '#181818',
    card: '#222',
    text: '#fff',
    secondary: '#4a4a4a',
  },
  light: {
    background: '#f5f5f5',
    card: '#fff',
    text: '#181818',
    secondary: '#d1d1d1',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && (saved === 'dark' || saved === 'light')) {
      setThemeName(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  const toggleTheme = () => {
    setThemeName((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 