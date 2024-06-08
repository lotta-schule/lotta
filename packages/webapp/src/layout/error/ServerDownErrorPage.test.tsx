import { render } from '@testing-library/react';
import { ServerDownErrorPage } from './ServerDownErrorPage';

describe('ServerDownErrorPage', () => {
  it('should render the ServerDownErrorPage component', () => {
    const screen = render(<ServerDownErrorPage error={new Error('Upsi')} />);
    expect(screen.container).toMatchSnapshot();
  });
});
