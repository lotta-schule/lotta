'use client';

import * as React from 'react';
import { Main, Sidebar } from 'layout';
import { RelevantFilesInUsage } from './queries';
import { StartStep } from './steps/StartStep';
import { ReviewArticlesStep } from './steps/ReviewArticlesStep';
import { ReviewFilesStep } from './steps/ReviewFilesStep';
import { ConfirmDeletionStep } from './steps/ConfirmDeletionStep';
import { DeleteConfirmationDialog } from './components';
import { ErrorBoundary } from './components';
import { ProfileDeleteStep } from './types';

import styles from './DeleteUserProfilePage.module.scss';

export const DeleteUserProfilePage = React.memo(() => {
  const [currentStep, setCurrentStep] = React.useState(ProfileDeleteStep.Start);
  const [selectedFilesToTransfer, setSelectedFilesToTransfer] =
    React.useState<RelevantFilesInUsage>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);

  const renderStep = React.useCallback(() => {
    switch (currentStep) {
      case ProfileDeleteStep.Start:
        return (
          <StartStep
            onNext={() => setCurrentStep(ProfileDeleteStep.ReviewArticles)}
            onPrevious={undefined}
          />
        );
      case ProfileDeleteStep.ReviewArticles:
        return (
          <ReviewArticlesStep
            onNext={() => setCurrentStep(ProfileDeleteStep.ReviewFiles)}
            onPrevious={() => setCurrentStep(ProfileDeleteStep.Start)}
          />
        );
      case ProfileDeleteStep.ReviewFiles:
        return (
          <ReviewFilesStep
            selectedFilesToTransfer={selectedFilesToTransfer}
            onFilesChange={setSelectedFilesToTransfer}
            onNext={() => setCurrentStep(ProfileDeleteStep.ConfirmDeletion)}
            onPrevious={() => setCurrentStep(ProfileDeleteStep.ReviewArticles)}
          />
        );
      case ProfileDeleteStep.ConfirmDeletion:
        return (
          <ConfirmDeletionStep
            selectedFilesToTransfer={selectedFilesToTransfer}
            onNext={() => setIsConfirmDialogOpen(true)}
            onPrevious={() => setCurrentStep(ProfileDeleteStep.ReviewFiles)}
          />
        );
    }
  }, [currentStep, selectedFilesToTransfer]);

  return (
    <>
      <Main className={styles.root}>
        <ErrorBoundary>
          <React.Suspense>{renderStep()}</React.Suspense>

          <DeleteConfirmationDialog
            open={isConfirmDialogOpen}
            selectedFilesToTransfer={selectedFilesToTransfer}
            onClose={() => setIsConfirmDialogOpen(false)}
          />
        </ErrorBoundary>
      </Main>
      <Sidebar isEmpty />
    </>
  );
});
DeleteUserProfilePage.displayName = 'DeleteUserProfilePage';
