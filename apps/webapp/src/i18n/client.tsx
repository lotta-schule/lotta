'use client';

import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { options } from './options';

i18next.use(initReactI18next).init(options);

export const TranslationsProvider = ({ children }: React.PropsWithChildren) => (
  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
);
