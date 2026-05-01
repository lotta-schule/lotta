'use client';

import * as React from 'react';
import { Main, Sidebar } from '#/layout/index.js';
import { RelevantFilesInUsage } from './queries.js';
import { StartStep } from './steps/StartStep.js';
import { ReviewArticlesStep } from './steps/ReviewArticlesStep.js';
import { ReviewFilesStep } from './steps/ReviewFilesStep.js';
import { ConfirmDeletionStep } from './steps/ConfirmDeletionStep.js';
import { DeleteConfirmationDialog } from './components/index.js';
import { ErrorBoundary } from './components/index.js';
import { ProfileDeleteStep } from './types.js';

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
