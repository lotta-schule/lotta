import { InitOptions } from 'i18next';
import de from 'locale/de.json';

export const options: InitOptions = {
  lng: 'de',
  supportedLngs: ['de'],
  fallbackLng: 'de',
  keySeparator: false,
  defaultNS: 'translation',
  resources: { de: { translation: de } },
};
