import React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Config } from './Config';

const downloadContentModule = {
  ...Klausurenplan.contentModules[1],
  files: [],
  configuration: {
    files: {},
  },
};

describe('shared/article/module/Download/Config', () => {
  it('should render a unchecked checkbox field to toggle hidePreviews which can be checked', async () => {
    const callback = vi.fn((cm) => {
      expect(cm.configuration.hidePreviews).toEqual(true);
    });
    const screen = render(
      <Config
        contentModule={downloadContentModule}
        onUpdateModule={callback}
        onRequestClose={() => {}}
      />
    );

    const checkbox = await screen.findByRole('checkbox', {
      name: /vorschaubilder anzeigen/i,
    });
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it('should render a checked checkbox field to toggle hidePreviews which can be unchecked', async () => {
    const callback = vi.fn((cm) => {
      expect(cm.configuration.hidePreviews).toEqual(false);
    });
    const screen = render(
      <Config
        contentModule={{
          ...downloadContentModule,
          configuration: { hidePreviews: true },
        }}
        onUpdateModule={callback}
        onRequestClose={() => {}}
      />
    );

    const checkbox = await screen.findByRole('checkbox', {
      name: /vorschaubilder anzeigen/i,
    });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });
});
