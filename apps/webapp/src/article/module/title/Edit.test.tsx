import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Edit } from './Edit';

const titleContentModule = Klausurenplan.contentModules[0];

describe('shared/article/module/table/Edit', () => {
  it('should display the correct title', () => {
    const screen = render(
      <Edit contentModule={titleContentModule} onUpdateModule={() => {}} />
    );
    expect(screen.getByRole('textbox')).toHaveValue(
      'Na, wie war dein erster Tag?'
    );
  });

  it('should correctly call the onUpateModule prop', async () => {
    const fireEvent = userEvent.setup();
    const callback = vi.fn((cm) => {
      expect(cm.content.title).toEqual('Eine neue Überschrift');
    });
    const screen = render(
      <Edit contentModule={titleContentModule} onUpdateModule={callback} />
    );
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    await fireEvent.clear(input);
    await fireEvent.type(input, 'Eine neue Überschrift');
    await fireEvent.click(document.body);
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
    expect(input).toHaveValue('Eine neue Überschrift');
  });

  it('should reset title when clicking ESC', async () => {
    const fireEvent = userEvent.setup();
    const callback = vi.fn((cm) => {
      expect(cm.content.title).toEqual('Na, wie war dein erster Tag?');
    });
    const screen = render(
      <Edit contentModule={titleContentModule} onUpdateModule={callback} />
    );
    const input = screen.getByRole('textbox');
    await fireEvent.clear(input);
    await fireEvent.type(input, 'Eine neue Überschr{Escape}');
    await waitFor(() => {
      expect(input).not.toHaveFocus();
    });
    expect(callback).toHaveBeenCalled();
    expect(input).toHaveValue('Na, wie war dein erster Tag?');
  });
});
