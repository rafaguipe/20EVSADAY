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
    background: '#f4f8f6',
    card: '#fff',
    text: '#183c37',
    secondary: '#dce8e3',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => { try { return localStorage.getItem('theme_v2') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });


  useEffect(() => {
    try { localStorage.setItem('theme_v2', themeName); } catch {}
  }, [themeName]);

  const toggleTheme = () => {
    setThemeName((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, toggleTheme, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 