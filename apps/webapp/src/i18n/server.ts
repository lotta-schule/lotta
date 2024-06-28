import { cache } from 'react';
import { createInstance, i18n } from 'i18next';
import { options } from './options';

export const serverTranslations = cache(async (i18n?: i18n) => {
  const instance = i18n || createInstance();
  await instance.init(options);

  return instance;
});
