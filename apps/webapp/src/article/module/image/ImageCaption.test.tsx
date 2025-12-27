import { render, waitFor } from 'test/util';
import { userEvent } from '@vitest/browser/context';
import { ImageCaption } from './ImageCaption';

describe('ImageCaption', () => {
  it('should render the caption', () => {
    const screen = render(
      <ImageCaption
        isEditModeEnabled={false}
        value="My Caption"
        onUpdate={vi.fn()}
      />
    );

    expect(screen.getByText('My Caption')).toBeVisible();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('should render the caption as an input and update it', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const screen = render(
      <ImageCaption isEditModeEnabled value="My Caption" onUpdate={onUpdate} />
    );

    expect(screen.queryByRole('textbox')).toHaveValue('My Caption');

    await user.type(screen.getByRole('textbox'), ' from test{Tab}');
    await user.tab();

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('My Caption from test');
    });
  });
});
