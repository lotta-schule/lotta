import * as React from 'react';
import { render, waitFor } from 'test/util';
import { TagsSelect } from './TagsSelect';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/editArticleLayouut/TagsSelect', () => {
  it('should render a TagsSelect without error', async () => {
    render(<TagsSelect value={[]} onChange={() => {}} />, {}, {});
  });

  it('should show a delete button for tags', async () => {
    const fireEvent = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(
      <TagsSelect value={['tag1']} onChange={onChange} />,
      {},
      {}
    );
    const tagElement = screen.getByTestId('Tag');
    expect(tagElement.querySelector('button')).toBeVisible();
    await fireEvent.click(tagElement.querySelector('button')!);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should show the correct options', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <TagsSelect value={[]} onChange={() => {}} />,
      {},
      { tags: ['tag', 'noch ein tag', 'wieder-tag'] }
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /vorschläge anzeigen/i })
    );
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation

    expect(screen.queryAllByRole('option').map((o) => o.textContent)).toEqual([
      'tag',
      'noch ein tag',
      'wieder-tag',
    ]);
  });

  it('should call onChange with the selected tag', async () => {
    const fireEvent = userEvent.setup();
    const onChangeFn = jest.fn();
    const screen = render(
      <TagsSelect value={[]} onChange={onChangeFn} />,
      {},
      { tags: ['tag', 'noch ein tag', 'wieder-tag'] }
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /vorschläge anzeigen/i })
    );
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation

    await fireEvent.click(
      screen.getByRole('option', { name: /noch ein tag/i })
    );
    expect(onChangeFn).toHaveBeenCalledWith(['noch ein tag']);
  });

  it('should deselect an already selected tag', async () => {
    const fireEvent = userEvent.setup();
    const onChangeFn = jest.fn();
    const screen = render(
      <TagsSelect value={['tag', 'noch ein tag']} onChange={onChangeFn} />,
      {},
      { tags: ['tag', 'noch ein tag', 'wieder-tag'] }
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fireEvent.click(
      screen.getByRole('button', { name: /vorschläge anzeigen/i })
    );
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation

    await fireEvent.click(
      screen.getByRole('option', { name: /noch ein tag/i })
    );
    expect(onChangeFn).toHaveBeenCalledWith(['tag']);
  });
});
