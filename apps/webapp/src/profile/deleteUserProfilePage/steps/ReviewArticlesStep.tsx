import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { useSuspenseQuery } from '@apollo/client/react';
import { ArticlesList } from 'shared/articlesList/ArticlesList';
import { useTenant } from 'util/tenant';
import { StepNavigation, StepNavigationProps } from '../components';
import { GET_OWN_ARTICLES } from '../queries';

import styles from '../DeleteUserProfilePage.module.scss';
import { ProfileDeleteStep } from '../types';

export type ReviewArticlesStepProps = Omit<
  StepNavigationProps<[]>,
  'currentStep'
>;

export const ReviewArticlesStep = (props: ReviewArticlesStepProps) => {
  const tenant = useTenant();
  const {
    data: { articles },
  } = useSuspenseQuery(GET_OWN_ARTICLES);

  const publishedArticlesCount = React.useMemo(
    () => articles?.filter((a) => a?.published).length,
    [articles]
  );

  return (
    <Box className={styles.container} data-testid={'ProfileDeleteStep2Box'}>
      <h4 className={styles.paragraph}>Deine Beiträge</h4>
      <p className={styles.paragraph}>
        Wenn dein Konto gelöscht ist, bleiben die sichtbaren Artikel erhalten,
        nur du wirst als Autor entfernt. Überprüfe, ob das für dich in Ordnung
        ist. Du hast hier nochmal die Gelegenheit, Beiträge zu überprüfen. Alle
        nicht-sichtbaren Beiträge (z.Bsp. Beiträge die in Bearbeitung sind)
        werden gelöscht.
      </p>
      <p className={styles.paragraph}>
        Du bist bei <strong>{publishedArticlesCount}</strong> veröffentlichten
        Beiträgen auf <em>{tenant.title}</em> als Autor eingetragen.
      </p>
      <ArticlesList articles={articles} />
      <StepNavigation
        currentStep={ProfileDeleteStep.ReviewArticles}
        {...props}
      />
    </Box>
  );
};
ReviewArticlesStep.displayName = 'ReviewArticlesStep';
