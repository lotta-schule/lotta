import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/hubert';
import { Presentation } from './Presentation';
import { loadTenant } from 'loader';
import { getBaseUrl } from 'helper';
import * as themes from './theme';

const defaultTheme = DefaultThemes.standard;

async function PresentationPage() {
  const [tenant, baseUrl] = await Promise.all([loadTenant(), getBaseUrl()]);

  const additionalThemes = [
    {
      title: 'Purple Pastel',
      theme: { ...defaultTheme, ...themes.PurplePastel },
    },
    { title: 'Neutral', theme: { ...defaultTheme, ...themes.Neutral } },
    {
      title: 'Retro Contrast',
      theme: { ...defaultTheme, ...themes.RetroContrast },
    },
  ];

  return (
    <Presentation
      tenant={tenant}
      baseUrl={baseUrl}
      additionalThemes={additionalThemes}
    />
  );
}

export default PresentationPage;
