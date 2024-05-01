import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
} from 'test-utils';
import userEvent from '@testing-library/user-event';

const defaultPath = fixtures.getPathForNode('8');

const WrappedToolbar = ({
  path = defaultPath,
  ...props
}: TestBrowserWrapperProps) => (
  <TestBrowserWrapper currentPath={path} {...props}>
    <Toolbar />
  </TestBrowserWrapper>
);

describe('browser/Toolbar', () => {
  test('renders component with correct elements', () => {
    render(<WrappedToolbar />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  test('calls onClick when "Zurück" button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<WrappedToolbar onNavigate={onNavigate} />);

    await user.click(screen.getByTitle('Zurück'));
    expect(onNavigate).toHaveBeenCalled();
  });

  test('calls onClick when "Ordner erstellen" button is clicked', async () => {
    const user = userEvent.setup();
    const setCurrentAction = vi.fn();
    render(
      <WrappedToolbar
        createDirectory={vi.fn()}
        setCurrentAction={setCurrentAction}
      />
    );
    await user.click(screen.getByTitle('Ordner erstellen'));
    expect(setCurrentAction).toHaveBeenCalled();
  });
});
