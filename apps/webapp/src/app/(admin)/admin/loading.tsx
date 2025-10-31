import { CircularProgress } from '@lotta-schule/hubert';
import { AdminPage } from './_component/AdminPage';
import { serverTranslations } from 'i18n/server';

export default async function Loading() {
  const { t } = await serverTranslations();
  return (
    <AdminPage title={t('Page is loading...')} takesFullSpace>
      <CircularProgress
        style={{
          marginTop: '25%',
          marginInline: 'auto',
        }}
        aria-label={t('Page is loading...')}
      />
    </AdminPage>
  );
}
