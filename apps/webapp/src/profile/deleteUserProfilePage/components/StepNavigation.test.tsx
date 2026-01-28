import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { StepNavigation } from './StepNavigation';
import { ProfileDeleteStep } from '../types';

describe('profile/deleteUserProfilePage/components/StepNavigation', () => {
  it('should show only next button on first step', () => {
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.Start}
        onNext={vi.fn()}
        onPrevious={undefined}
      />
    );

    expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /zurück/i })).toBeNull();
  });

  it('should show both buttons on middle steps', () => {
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.ReviewArticles}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should show delete button on last step', () => {
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.ConfirmDeletion}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /Daten endgültig löschen/i })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should call onNext when next button clicked', async () => {
    const fireEvent = userEvent.setup();
    const onNext = vi.fn();
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.ReviewArticles}
        onNext={onNext}
        onPrevious={vi.fn()}
      />
    );

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledOnce();
    });
  });

  it('should call onPrevious when back button clicked', async () => {
    const fireEvent = userEvent.setup();
    const onPrevious = vi.fn();
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.ReviewArticles}
        onNext={vi.fn()}
        onPrevious={onPrevious}
      />
    );

    await fireEvent.click(screen.getByRole('button', { name: /zurück/i }));
    await waitFor(() => {
      expect(onPrevious).toHaveBeenCalledOnce();
    });
  });

  it('should call onNext when delete button clicked on last step', async () => {
    const fireEvent = userEvent.setup();
    const onNext = vi.fn();
    const screen = render(
      <StepNavigation
        currentStep={ProfileDeleteStep.ConfirmDeletion}
        onNext={onNext}
        onPrevious={vi.fn()}
      />
    );

    await fireEvent.click(
      screen.getByRole('button', { name: /Daten endgültig löschen/i })
    );
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledOnce();
    });
  });
});
