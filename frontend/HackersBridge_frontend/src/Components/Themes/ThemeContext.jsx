import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from './Themes';

const ThemeContext = createContext();



export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [loading, setLoading] = useState(true);

  // Load user theme from backend on component mount
  useEffect(() => {
    loadUserTheme();
  }, []);


  const loadUserTheme = () => {
    const savedTheme = localStorage.getItem("selectedTheme");
    setCurrentTheme(savedTheme || "default"); // fallback to default
    setLoading(false); // mark loading complete
  };



  // const loadUserTheme = async () => {
  //   try {
  //     const token = localStorage.getItem('authToken');
  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     const response = await fetch('/api/user/theme/', {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.theme && themes[data.theme]) {
  //         setCurrentTheme(data.theme);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error loading user theme:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const saveTheme = async (themeKey) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // If no token, just save locally
        setCurrentTheme(themeKey);
        localStorage.setItem('selectedTheme', themeKey);
        return;
      }

      const response = await fetch('/api/user/theme/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: themeKey }),
      });

      if (response.ok) {
        setCurrentTheme(themeKey);
        localStorage.setItem('selectedTheme', themeKey);
      } else {
        throw new Error('Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      // Fallback to local storage
      setCurrentTheme(themeKey);
      localStorage.setItem('selectedTheme', themeKey);
    }
  };

  const value = {
    currentTheme,
    themes,
    saveTheme,
    loading,
    getTheme: () => themes[currentTheme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};