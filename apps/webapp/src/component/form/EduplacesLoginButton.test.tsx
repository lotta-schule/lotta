import { render, userEvent, waitFor } from 'test/util';
import { EduplacesLoginButton } from './EduplacesLoginButton';
import { redirectTo } from 'util/browserLocation';

describe('EduplacesLoginButton', () => {
  it('should render the button', async () => {
    const screen = render(<EduplacesLoginButton />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeVisible();
    });
    expect(screen.getByRole('button')).toHaveTextContent(
      /eduplaces.*anmelden/i
    );
  });

  it('should redirect the user to the external login page on click', async () => {
    const user = userEvent.setup();

    const screen = render(<EduplacesLoginButton />);

    expect(screen.getByRole('button')).toBeVisible();
    await user.click(screen.getByRole('button'));

    expect(redirectTo).toHaveBeenCalledWith(
      expect.stringContaining('/auth/oauth/eduplaces/login')
    );
  });
});
