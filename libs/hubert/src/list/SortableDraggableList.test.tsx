import { render, screen } from '#/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { SortableDraggableList, SortableItem } from './SortableDraggableList';

describe('SortableDraggableList', () => {
  const items = [
    { id: '1', title: 'Item 1', testId: 'item-1' },
    { id: '2', title: 'Item 2', testId: 'item-2' },
    { id: '3', title: 'Item 3', testId: 'item-3' },
  ] satisfies SortableItem[];

  it('should render all the items', () => {
    const onChange = vi.fn();
    render(
      <SortableDraggableList id="test-list" items={items} onChange={onChange} />
    );
    items.forEach(({ title, testId }) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('should call onChange when provided', () => {
    const onChange = vi.fn();
    render(
      <SortableDraggableList id="test-list" items={items} onChange={onChange} />
    );

    expect(onChange).toBeDefined();
    expect(typeof onChange).toBe('function');
  });

  it('should handle onDragStart callback', () => {
    const onChange = vi.fn();
    const onDragStart = vi.fn();
    render(
      <SortableDraggableList
        id="test-list"
        items={items}
        onChange={onChange}
        onDragStart={onDragStart}
      />
    );

    expect(onDragStart).toBeDefined();
  });

  it('should handle onDragEnd callback', () => {
    const onChange = vi.fn();
    const onDragEnd = vi.fn();
    render(
      <SortableDraggableList
        id="test-list"
        items={items}
        onChange={onChange}
        onDragEnd={onDragEnd}
      />
    );

    expect(onDragEnd).toBeDefined();
  });

  it('should apply disabled state', () => {
    const onChange = vi.fn();
    render(
      <SortableDraggableList
        id="test-list"
        items={items}
        onChange={onChange}
        disabled
      />
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
  });

  it('should pass custom className', () => {
    const onChange = vi.fn();
    render(
      <SortableDraggableList
        id="test-list"
        items={items}
        onChange={onChange}
        className="custom-class"
      />
    );

    expect(screen.getByRole('list')).toHaveClass('custom-class');
  });

  it('should handle items with icon and children', () => {
    const fullItems = [
      {
        id: '1',
        title: 'Item 1',
        icon: <span data-testid="icon">Icon</span>,
        testId: 'item-1',
        children: <div data-testid="child">Child</div>,
      },
    ] satisfies SortableItem[];

    const onChange = vi.fn();
    render(
      <SortableDraggableList
        id="test-list"
        items={fullItems}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should handle empty items list', () => {
    const onChange = vi.fn();
    render(
      <SortableDraggableList id="test-list" items={[]} onChange={onChange} />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('should handle single item', () => {
    const onChange = vi.fn();
    const singleItem = [
      { id: '1', title: 'Single Item' },
    ] satisfies SortableItem[];
    render(
      <SortableDraggableList
        id="test-list"
        items={singleItem}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Single Item')).toBeInTheDocument();
  });
});
