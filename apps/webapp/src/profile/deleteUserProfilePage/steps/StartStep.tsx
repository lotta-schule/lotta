import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { useTenant } from 'util/tenant';
import { StepNavigation, StepNavigationProps } from '../components';
import { ProfileDeleteStep } from '../types';
import clsx from 'clsx';

import styles from '../DeleteUserProfilePage.module.scss';

export type StartStepProps = Omit<
  StepNavigationProps<[], (typeof ProfileDeleteStep)['Start']>,
  'currentStep'
>;

export const StartStep = (props: StartStepProps) => {
  const tenant = useTenant();
  return (
    <Box className={styles.container} data-testid={'ProfileDeleteStep1Box'}>
      <h3 className={styles.paragraph}>Benutzerkonto und Daten löschen</h3>
      <p className={styles.paragraph}>
        Deine Zeit bei <em>{tenant.title}</em> ist vorbei und du möchtest dein
        Benutzerkonto mit deinen persönlichen Dateien und Daten löschen?
      </p>
      <div className={styles.paragraph}>
        <p>
          Es ist wichtig zu wissen, wo persönliche Daten von dir und über dich
          gespeichert sind.
        </p>
        <p>Hier erhältst du eine Übersicht darüber,</p>
      </div>
      <ul className={clsx(styles.paragraph, styles.list)}>
        <li>welche Daten Lotta über dich gespeichert hat,</li>
        <li>welche gelöscht werden können und</li>
        <li>
          welche Daten du an <em>{tenant.title}</em> übergeben kannst, sodass
          nachfolgende Generationen auf der Homepage von <em>{tenant.title}</em>{' '}
          von dir lesen können.
        </li>
      </ul>
      <StepNavigation currentStep={ProfileDeleteStep.Start} {...props} />
    </Box>
  );
};
StartStep.displayName = 'StartStep';
