import { cache } from 'react';
import { createInstance, i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export const serverTranslations = cache(async (i18n: i18n) => {
  const instance = i18n || createInstance();
  return await instance.use(initReactI18next).init({
    resources,
    lng: 'de',
    fallbackLng: 'de',

    keySeparator: '.',

    interpolation: {
      escapeValue: false,
    },
  });
});
