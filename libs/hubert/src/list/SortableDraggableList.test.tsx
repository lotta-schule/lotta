import { render } from 'test-utils';
import { describe, it, expect, vi } from 'vitest';
import { SortableDraggableList, SortableItem } from './SortableDraggableList';

describe('SortableDraggableList', () => {
  const items = [
    { id: '1', title: 'Item 1', testId: 'item-1' },
    { id: '2', title: 'Item 2', testId: 'item-2' },
    { id: '3', title: 'Item 3', testId: 'item-3' },
  ] satisfies SortableItem[];

  it('should render all the items.', () => {
    const onChange = vi.fn();
    const screen = render(
      <SortableDraggableList id="test-list" items={items} onChange={onChange} />
    );
    items.forEach(({ title, testId }) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
