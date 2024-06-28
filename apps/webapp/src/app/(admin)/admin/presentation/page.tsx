import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/hubert';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from '../_component/AdminPage';
import { loadTenant } from 'loader';
import { getBaseUrl } from 'helper';
import * as themes from './_theme';
import { Presentation } from './Presentation';

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
    <AdminPage icon={faPalette} title={'Darstellung'} hasHomeLink>
      <Presentation
        tenant={tenant}
        baseUrl={baseUrl}
        additionalThemes={additionalThemes}
      />
    </AdminPage>
  );
}

export default PresentationPage;
