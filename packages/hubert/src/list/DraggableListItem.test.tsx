import { render } from 'test-utils';
import { DraggableListItem } from './DraggableListItem';

import styles from './DraggableListItem.module.scss';
import userEvent from '@testing-library/user-event';

describe('DraggableListItem', () => {
  it('should render the title', () => {
    const screen = render(<DraggableListItem title="Test Title" />);
    expect(screen.getByRole('listitem', { name: 'Test Title' })).toBeVisible();
  });

  it('applies selected class when selected prop is true', () => {
    const screen = render(<DraggableListItem title="Selected Item" selected />);
    expect(screen.getByRole('listitem')).toHaveClass(styles.selected);
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const screen = render(
      <DraggableListItem title="Clickable Item" onClick={handleClick} />
    );
    await user.click(screen.getByText('Clickable Item'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon and handles icon click', async () => {
    const user = userEvent.setup();

    const onClick = vi.fn();
    const onClickIcon = vi.fn();

    const screen = render(
      <DraggableListItem
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

  it('renders drag handle when dragHandleProps are provided', () => {
    const dragHandleProps: any = {
      'data-testid': 'drag-handle',
      draggable: true,
    };
    const screen = render(
      <DraggableListItem
        title="Draggable Item"
        dragHandleProps={dragHandleProps}
      />
    );
    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toBeVisible();
  });
});
