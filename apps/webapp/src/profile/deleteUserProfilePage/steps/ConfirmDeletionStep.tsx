import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { RelevantFilesInUsage } from '../queries';
import { useTenant } from 'util/tenant';
import clsx from 'clsx';

import styles from '../DeleteUserProfilePage.module.scss';
import { StepNavigation, StepNavigationProps } from '../components';
import { ProfileDeleteStep } from '../types';

export type ConfirmDeletionStepProps = Omit<
  StepNavigationProps<[]>,
  'currentStep'
> & {
  selectedFilesToTransfer: RelevantFilesInUsage;
};

export const ConfirmDeletionStep = ({
  selectedFilesToTransfer,
  ...props
}: ConfirmDeletionStepProps) => {
  const tenant = useTenant();
  return (
    <Box className={styles.container} data-testid={'ProfileDeleteStep4Box'}>
      <h4 className={styles.paragraph}>Löschanfrage bestätigen</h4>
      <p className={styles.paragraph}>
        Deine Daten können nun gelöscht werden.
      </p>
      <ul className={clsx(styles.paragraph, styles.list)}>
        <li>
          Von dir erstellte, nicht veröffentlichte Beiträge, bei denen es keine
          anderen AutorInnen gibt, werden gelöscht
        </li>
        <li>
          Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht sind
        </li>
        {selectedFilesToTransfer.length > 0 && (
          <li>
            Deine Dateien und Ordner, ausgenommen die{' '}
            <em>{selectedFilesToTransfer.length} Dateien</em>, die du{' '}
            {tenant.title} überlässt, werden gelöscht
          </li>
        )}
        {selectedFilesToTransfer.length === 0 && (
          <li>Alle deine Dateien und Ordner werden gelöscht</li>
        )}
        <li>
          Dein Nutzeraccount und alle darin gespeicherten Informationen werden
          gelöscht [Hinweis: Es kann bis zu vier Wochen dauern, bis die
          allerletzten Daten, wie IP-Adressen aus Logs, oder Daten die sich in
          Backups befinden, gelöscht werden.]
        </li>
      </ul>
      <p className={styles.paragraph}>
        Wenn du einverstanden bist, klicke auf 'Daten endgültig löschen'. Du
        wirst dann abgemeldet und auf die Startseite weitergeleitet.
      </p>
      <p className={styles.paragraph}>Dieser Vorgang ist endgültig.</p>
      <StepNavigation
        currentStep={ProfileDeleteStep.ConfirmDeletion}
        {...props}
      />
    </Box>
  );
};
ConfirmDeletionStep.displayName = 'ConfirmDeletionStep';
