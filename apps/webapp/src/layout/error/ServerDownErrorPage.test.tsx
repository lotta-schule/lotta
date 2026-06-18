import { render } from '@testing-library/react';
import { ServerDownErrorPage } from './ServerDownErrorPage';

describe('ServerDownErrorPage', () => {
  it('should render the ServerDownErrorPage component', () => {
    const screen = render(<ServerDownErrorPage error={new Error('Upsi')} />);
    expect(screen.container).toMatchSnapshot();
  });

  it('should render the default title when no title prop is provided', () => {
    const screen = render(<ServerDownErrorPage error={new Error('Upsi')} />);
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Server nicht erreichbar');
  });

  it('should render custom title when title prop is provided', () => {
    const screen = render(
      <ServerDownErrorPage error={new Error('Upsi')} title="Custom Error" />
    );
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Custom Error');
  });

  it('should render error message as subtitle', () => {
    const errorMessage = 'Connection timeout';
    const screen = render(
      <ServerDownErrorPage error={new Error(errorMessage)} />
    );
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent(errorMessage);
  });
});
