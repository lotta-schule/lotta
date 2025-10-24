import { render } from 'test/util';
import { EduplacesLoginButton } from './EduplacesLoginButton';
import userEvent from '@testing-library/user-event';

describe('CreateWidgetButton', () => {
  it('should render the button', () => {
    const screen = render(<EduplacesLoginButton />);

    expect(screen.getByRole('button')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent(
      /eduplaces.*anmelden/i
    );
  });

  it('should redirect the user to the external login page on click', async () => {
    const user = userEvent.setup();

    const screen = render(<EduplacesLoginButton />);

    expect(screen.getByRole('button')).toBeVisible();
    await user.click(screen.getByRole('button'));

    expect(window.location.href).toContain('/auth/oauth/eduplaces/login');
  });
});
