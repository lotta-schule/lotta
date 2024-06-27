import { render } from 'test/util';
import { ImageCaption } from './ImageCaption';
import userEvent from '@testing-library/user-event';

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

    await user.type(screen.getByRole('textbox'), ' from test');
    await user.tab();

    expect(onUpdate).toHaveBeenCalledWith('My Caption from test');
  });
});
