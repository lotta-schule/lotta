import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/hubert';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from '../_component/AdminPage';
import { loadTenant } from 'loader';
import * as themes from './_theme';
import { Presentation } from './Presentation';

const defaultTheme = DefaultThemes.standard;

async function PresentationPage() {
  const tenant = await loadTenant();

  const additionalThemes = [
    {
      title: 'Frau Flieders Pastellpalast',
      theme: { ...defaultTheme, ...themes.PurplePastel },
    },
    { title: 'Klassenbester', theme: { ...defaultTheme, ...themes.Neutral } },
    {
      title: 'Schiefertafel',
      theme: { ...defaultTheme, ...themes.RetroContrast },
    },
  ];

  return (
    <AdminPage icon={faPalette} title={'Darstellung'} hasHomeLink>
      <Presentation tenant={tenant} additionalThemes={additionalThemes} />
    </AdminPage>
  );
}

export default PresentationPage;
