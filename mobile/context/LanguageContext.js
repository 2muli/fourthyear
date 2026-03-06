import React, { createContext, useState, useEffect } from "react";
import i18n from "../src/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.locale);

  useEffect(() => {
    // Load saved language from AsyncStorage
    const loadLanguage = async () => {
      const lang = await AsyncStorage.getItem("appLanguage");
      if (lang) {
        i18n.locale = lang;
        setLanguage(lang);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    i18n.locale = lang;
    setLanguage(lang);
    await AsyncStorage.setItem("appLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};