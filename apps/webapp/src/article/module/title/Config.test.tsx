import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Config } from './Config';

const titleContentModule = Klausurenplan.contentModules[0];

describe('shared/article/module/title/Config', () => {
  it('should render a select field with 3 size options', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <Config
        contentModule={titleContentModule}
        onUpdateModule={() => {}}
        onRequestClose={() => {}}
      />
    );

    await fireEvent.click(
      screen.getByRole('button', { name: /Überschrifgrößen/ })
    );
    expect(screen.queryAllByRole('option')).toHaveLength(3);
  });

  it('should show the selected option', () => {
    const contentModule = {
      ...titleContentModule,
      configuration: {
        level: '6',
      },
    };
    const screen = render(
      <Config
        contentModule={contentModule}
        onUpdateModule={() => {}}
        onRequestClose={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /klein/i })).toBeVisible();
  });

  it('should change the size configuration', async () => {
    const fireEvent = userEvent.setup();
    const callback = vi.fn((cm) => {
      expect(cm.configuration.level).toEqual(6);
    });
    const screen = render(
      <Config
        contentModule={titleContentModule}
        onUpdateModule={callback}
        onRequestClose={() => {}}
      />
    );

    await fireEvent.click(
      screen.getByRole('button', { name: /Überschrifgrößen/i })
    );
    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation
    await fireEvent.click(screen.getByRole('option', { name: /klein/ }));
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });
});
