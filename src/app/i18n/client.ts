'use client'

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';

i18next
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    ns: ['common'],
    defaultNS: 'common',
  });

export function useTranslation(namespace: string = 'common') {
  return useTranslationOrg(namespace);
} 