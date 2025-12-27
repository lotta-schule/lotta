import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { StartStep } from './StartStep';

describe('profile/deleteUserProfilePage/steps/StartStep', () => {
  it('should render welcome content with tenant name', () => {
    const screen = render(
      <StartStep onNext={vi.fn()} onPrevious={undefined} />
    );
    expect(screen.getByText(/Benutzerkonto und Daten löschen/)).toBeVisible();
    expect(screen.getAllByText(/DerEineVonHier/)[0]).toBeVisible();
  });

  it('should show navigation with only next button', () => {
    const screen = render(
      <StartStep onNext={vi.fn()} onPrevious={undefined} />
    );
    expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /zurück/i })).toBeNull();
  });

  it('should call onNext when next button is clicked', async () => {
    const fireEvent = userEvent.setup();
    const onNext = vi.fn();
    const screen = render(<StartStep onNext={onNext} onPrevious={undefined} />);

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledOnce();
    });
  });
});
