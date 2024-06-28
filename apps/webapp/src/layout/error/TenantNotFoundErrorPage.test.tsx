import { render } from '@testing-library/react';
import { TenantNotFoundErrorPage } from './TenantNotFoundErrorPage';

describe('TenantNotFoundErrorPage', () => {
  it('should render the TenantNotFoundErrorPage component', () => {
    const screen = render(<TenantNotFoundErrorPage />);
    expect(screen.container).toMatchSnapshot();
  });
});
