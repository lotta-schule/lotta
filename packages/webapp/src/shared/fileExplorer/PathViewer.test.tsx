import * as React from 'react';
import { render } from 'test/util';
import { PathViewer } from './PathViewer';
import userEvent from '@testing-library/user-event';

describe('fileExplorer/PathViewer', () => {
  it('should render correctly on home path', () => {
    const screen = render(
      <PathViewer path={[{ id: null }]} onChange={vi.fn()} />
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: 'Wurzelverzeichnis' })
    ).toBeVisible();
  });

  it('should render correctly on a complex path', () => {
    const screen = render(
      <PathViewer
        path={[
          { id: null },
          { id: '123', name: 'Test 1' },
          { id: '444', name: 'Test 2' },
        ]}
        onChange={vi.fn()}
      />
    );
    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveTextContent('Test 1');
    expect(links[2]).toHaveTextContent('Test 2');
  });

  it('should select a path on click', async () => {
    const fireEvent = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <PathViewer
        path={[
          { id: null },
          { id: '123', name: 'Test 1' },
          { id: '444', name: 'Test 2' },
          { id: '12312', name: 'Test 3' },
        ]}
        onChange={onChange}
      />
    );
    await fireEvent.click(screen.getByRole('link', { name: 'Test 2' }));
    expect(onChange).toHaveBeenCalledWith([
      { id: null },
      { id: '123', name: 'Test 1' },
      { id: '444', name: 'Test 2' },
    ]);
  });
});
