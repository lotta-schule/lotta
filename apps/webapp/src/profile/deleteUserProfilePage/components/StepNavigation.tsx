import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faTriangleExclamation,
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@lotta-schule/hubert';

import styles from '../DeleteUserProfilePage.module.scss';
import { ProfileDeleteStep } from '../types';

export type StepNavigationProps<
  NextArgs extends Array<any>,
  T = ProfileDeleteStep,
> = {
  currentStep: T;
  onNext: (...args: NextArgs) => void;
  onPrevious: T extends (typeof ProfileDeleteStep)['Start']
    ? undefined
    : () => void;
};

export const StepNavigation = <NextArgs extends Array<any>>({
  currentStep,
  onPrevious,
  onNext,
}: StepNavigationProps<NextArgs>) => {
  const nextButton = React.useMemo(() => {
    if (currentStep === ProfileDeleteStep.ConfirmDeletion) {
      return (
        <Button
          small
          className={styles.deleteButton}
          icon={<Icon icon={faTriangleExclamation} />}
          onClick={onNext}
        >
          Daten endgültig löschen
        </Button>
      );
    }
    return (
      <Button
        small
        icon={<Icon icon={faAngleRight} size={'lg'} />}
        onClick={onNext}
      >
        Weiter
      </Button>
    );
  }, [currentStep, onNext]);

  return (
    <Box className={styles.stepNavigation}>
      <div>
        {currentStep > ProfileDeleteStep.Start ? (
          <Button
            small
            icon={<Icon icon={faAngleLeft} size={'lg'} />}
            disabled={currentStep <= ProfileDeleteStep.Start}
            onClick={onPrevious}
          >
            Zurück
          </Button>
        ) : (
          <div />
        )}
        {nextButton}
      </div>
    </Box>
  );
};
StepNavigation.displayName = 'StepNavigation';
