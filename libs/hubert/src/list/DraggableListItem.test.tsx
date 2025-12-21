import { render, userEvent } from 'test-utils';
import { DraggableListItem } from './DraggableListItem';

import styles from './DraggableListItem.module.scss';

describe('DraggableListItem', () => {
  it('should render the title', () => {
    const screen = render(<DraggableListItem id="1" title="Test Title" />);
    expect(screen.getByRole('button', { name: /Test Title/ })).toBeVisible();
  });

  it('applies selected class when selected prop is true', () => {
    const screen = render(
      <DraggableListItem id="1" title="Selected Item" selected />
    );
    expect(screen.getByRole('button')).toHaveClass(styles.selected);
  });

  describe('draghable', () => {
    it('should be rendered', () => {
      const screen = render(
        <DraggableListItem title="Draggable Item" id="1" />
      );
      expect(screen.getByTestId('drag-handle')).toBeVisible();
    });

    it('should not be rendered when isDraggable is set to false', () => {
      const screen = render(
        <DraggableListItem title="Draggable Item" id="1" isDraggable={false} />
      );
      expect(screen.queryByTestId('drag-handle')).toBeNull();
    });
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const screen = render(
      <DraggableListItem id="1" title="Clickable Item" onClick={handleClick} />
    );
    await user.click(screen.getByText('Clickable Item'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders icon and handles icon click', async () => {
    const user = userEvent.setup();

    const onClick = vi.fn();
    const onClickIcon = vi.fn();

    const screen = render(
      <DraggableListItem
        id="1"
        title="Item with Icon"
        icon={<div>Icon</div>}
        onClick={onClick}
        onClickIcon={onClickIcon}
      />
    );
    const icon = screen.getByText('Icon');
    expect(icon).toBeVisible();
    await user.click(icon);
    expect(onClickIcon).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
