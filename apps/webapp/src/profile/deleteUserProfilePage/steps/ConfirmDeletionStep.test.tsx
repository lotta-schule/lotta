import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { ConfirmDeletionStep } from './ConfirmDeletionStep';

describe('profile/deleteUserProfilePage/steps/ConfirmDeletionStep', () => {
  it('should show what will be deleted', () => {
    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={[]}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(screen.getByText(/Löschanfrage bestätigen/)).toBeVisible();
    expect(
      screen.getByText(/nicht veröffentlichte Beiträge.*werden gelöscht/i)
    ).toBeVisible();
    expect(screen.getByText(/Nutzeraccount.*werden gelöscht/i)).toBeVisible();
  });

  it('should show files will be deleted when no files transferred', () => {
    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={[]}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Alle deine Dateien und Ordner werden gelöscht/i)
    ).toBeVisible();
  });

  it('should show count of transferred files when files are selected', () => {
    const mockFiles = [
      { id: '1', filename: 'file1.jpg' },
      { id: '2', filename: 'file2.jpg' },
    ];

    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={mockFiles}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(screen.getByText('2 Dateien', { exact: false })).toBeVisible();
    expect(screen.getByText(/überlässt/i)).toBeVisible();
  });

  it('should show deletion button as next action', () => {
    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={[]}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /Daten endgültig löschen/i })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should call onNext when deletion button clicked', async () => {
    const fireEvent = userEvent.setup();
    const onNext = vi.fn();
    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={[]}
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

  it('should call onPrevious when back button clicked', async () => {
    const fireEvent = userEvent.setup();
    const onPrevious = vi.fn();
    const screen = render(
      <ConfirmDeletionStep
        selectedFilesToTransfer={[]}
        onNext={vi.fn()}
        onPrevious={onPrevious}
      />
    );

    await fireEvent.click(screen.getByRole('button', { name: /zurück/i }));
    await waitFor(() => {
      expect(onPrevious).toHaveBeenCalledOnce();
    });
  });
});
