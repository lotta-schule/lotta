import * as React from 'react';
import { Box, Tabbar, Tab } from '@lotta-schule/hubert';
import { useSuspenseQuery } from '@apollo/client/react';
import { UserBrowser } from 'shared/browser';
import {
  FileSelection,
  StepNavigation,
  StepNavigationProps,
} from '../components';
import { useTenant } from 'util/tenant';
import { GET_RELEVANT_FILES_IN_USAGE, RelevantFilesInUsage } from '../queries';
import { ProfileDeleteStep } from '../types';

import styles from '../DeleteUserProfilePage.module.scss';

export type ReviewFilesStepProps = Omit<
  StepNavigationProps<[]>,
  'currentStep'
> & {
  selectedFilesToTransfer: RelevantFilesInUsage;
  onFilesChange: (files: RelevantFilesInUsage) => void;
};

export const ReviewFilesStep = ({
  selectedFilesToTransfer,
  onFilesChange,
  ...props
}: ReviewFilesStepProps) => {
  const tenant = useTenant();

  const {
    data: { files: relevantFiles },
  } = useSuspenseQuery(GET_RELEVANT_FILES_IN_USAGE);

  const [selectedFilesTab, setSelectedFilesTab] = React.useState(
    relevantFiles?.length
      ? ('handover-files' as const)
      : ('all-files-investigation' as const)
  );

  return (
    <Box className={styles.container} data-testid={'ProfileDeleteStep3Box'}>
      {!!relevantFiles?.length && (
        <Tabbar
          value={selectedFilesTab}
          onChange={(val) =>
            setSelectedFilesTab(val as typeof selectedFilesTab)
          }
        >
          <Tab
            value={'handover-files'}
            label={`Dateien übergeben (${selectedFilesToTransfer.length}/${relevantFiles.length})`}
          />
          <Tab
            value={'all-files-investigation'}
            label={'Alle Dateien überprüfen'}
          />
        </Tabbar>
      )}

      <div
        role={'tabpanel'}
        hidden={selectedFilesTab !== 'handover-files'}
        aria-labelledby={'tabpanel-handover-heading'}
      >
        <h4 className={styles.paragraph} id={'tabpanel-handover-heading'}>
          Dateien aus genutzten Beiträgen übergeben
        </h4>
        <p className={styles.paragraph}>
          Es gibt Dateien, die du hochgeladen hast, die bei{' '}
          <em>{tenant.title}</em> in Beiträgen sichtbar sind.
        </p>
        <p className={styles.paragraph}>
          Du hast jetzt die Möglichkeit, die Nutzungsrechte an diesen Dateien{' '}
          <em>{tenant.title}</em> zu übergeben. Dadurch bleiben die Beiträge
          weiter vollständig und die Dateien wären weiter für Nutzer sichtbar.
        </p>
        <p className={styles.paragraph}>
          Überlege dir gut, für welche Dateien du <em>{tenant.title}</em>{' '}
          erlauben möchtest, sie weiterhin auf ihrer Webseite zu zeigen. Wenn
          dein Benutzerkonto erst gelöscht ist, kann der Vorgang nicht mehr
          korrigiert werden, und du wirst dich persönlich an einen Administrator
          wenden müssen.
        </p>
        <FileSelection
          files={relevantFiles}
          selectedFiles={selectedFilesToTransfer}
          onSelectFiles={onFilesChange}
        />
      </div>
      <div
        role={'tabpanel'}
        hidden={selectedFilesTab !== 'all-files-investigation'}
        aria-labelledby={'tabpanel-files-heading'}
      >
        <h4 className={styles.paragraph} id={'tabpanel-files-heading'}>
          Alle Dateien überprüfen
        </h4>
        <p className={styles.paragraph}>
          Du kannst Dateien, die du behalten möchtest, zur Sicherheit
          herunterladen. Andere Dateien werden endgültig gelöscht.
        </p>
        <UserBrowser />
      </div>
      <StepNavigation currentStep={ProfileDeleteStep.ReviewFiles} {...props} />
    </Box>
  );
};
ReviewFilesStep.displayName = 'ReviewFilesStep';
