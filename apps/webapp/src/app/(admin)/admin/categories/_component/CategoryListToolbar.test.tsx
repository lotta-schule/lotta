import {} from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Mock, vi } from 'vitest';
import { CategoryListToolbar } from './CategoryListToolbar';
import { useRouter } from 'next/navigation';
import { CreateCategoryDialogProps } from './CreateCategoryDialog';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the CreateCategoryDialog component
vi.mock('./CreateCategoryDialog', () => ({
  CreateCategoryDialog: ({
    isOpen,
    onAbort,
    onConfirm,
  }: CreateCategoryDialogProps) =>
    isOpen && (
      <div data-testid="CreateCategoryDialog">
        <button onClick={onAbort} data-testid="AbortButton">
          Abort
        </button>
        <button
          onClick={() => onConfirm({ id: 'new-category' } as any)}
          data-testid="ConfirmButton"
        >
          Confirm
        </button>
      </div>
    ),
}));

describe('CategoryListToolbar', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue(mockRouter);
    vi.clearAllMocks();
  });

  it('should render without errors and shows the create button', () => {
    const screen = render(<CategoryListToolbar />);
    expect(screen.getByText('Kategorie erstellen')).toBeInTheDocument();
    expect(
      screen.queryByTestId('CreateCategoryDialog')
    ).not.toBeInTheDocument();
  });

  it('should open the CreateCategoryDialog when the button is clicked', () => {
    const screen = render(<CategoryListToolbar />);
    const createButton = screen.getByText('Kategorie erstellen');
    fireEvent.click(createButton);
    expect(screen.getByTestId('CreateCategoryDialog')).toBeInTheDocument();
  });

  it('closes the dialog on abort', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <CategoryListToolbar />
    );
    const createButton = getByText('Kategorie erstellen');
    fireEvent.click(createButton);

    const abortButton = getByTestId('AbortButton');
    fireEvent.click(abortButton);
    expect(queryByTestId('CreateCategoryDialog')).not.toBeInTheDocument();
  });

  it('closes the dialog and navigates to the new category page on confirm', () => {
    const screen = render(<CategoryListToolbar />);
    const createButton = screen.getByText('Kategorie erstellen');
    fireEvent.click(createButton);

    const confirmButton = screen.getByTestId('ConfirmButton');
    fireEvent.click(confirmButton);

    expect(
      screen.queryByTestId('CreateCategoryDialog')
    ).not.toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/admin/categories/new-category'
    );
  });
});
