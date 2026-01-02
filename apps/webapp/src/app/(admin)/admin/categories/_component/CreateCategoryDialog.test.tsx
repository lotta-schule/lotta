import * as React from 'react';
import { render, screen, waitFor, within, userEvent } from 'test/util';
import { FaecherCategory, SomeUser } from 'test/fixtures';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { CategoryModel } from 'model';
import CreateCategoryMutation from 'api/mutation/CreateCategoryMutation.graphql';

const createMocks = (props?: Partial<CategoryModel>) => [
  {
    request: {
      query: CreateCategoryMutation,
      variables: {
        category: {
          title: 'Test',
          category: null,
          isSidenav: false,
          ...props,
          ...(props?.category && {
            category: { id: props.category.id },
          }),
        },
      },
    },
    result: {
      data: {
        category: {
          id: 666,
          title: 'Test',
          sortKey: 10,
          isSidenav: false,
          isHomepage: false,
          hideArticlesFromHomepage: false,
          redirect: null,
          layoutName: '',
          bannerImageFile: null,
          groups: [],
          widgets: [],
          ...props,
          category: props?.category
            ? {
                id: props.category.id,
                title: props.category.title,
                hideArticlesFromHomepage:
                  props.category.hideArticlesFromHomepage,
              }
            : null,
        },
      },
    },
  },
];

describe('shared/layouts/adminLayout/userManagment/CreateCategoryDialog', () => {
  it('should have the focus on the input field on open', async () => {
    render(
      <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />
    );
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toBeVisible();
    });
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toHaveFocus();
    });
  });

  it('should start with a disabled submit button, but should enable the button when text has been entered', async () => {
    const fireEvent = userEvent.setup();
    render(
      <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />
    );
    expect(screen.getByRole('button', { name: /erstellen/ })).toBeDisabled();
    await fireEvent.type(screen.getByRole('textbox'), 'Test');
    expect(
      screen.getByRole('button', { name: /erstellen/ })
    ).not.toBeDisabled();
  });

  it('should reset the input field when dialog is closed and then reopened', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />
    );
    await fireEvent.type(screen.getByRole('textbox'), 'Test');
    screen.rerender(
      <CreateCategoryDialog
        isOpen={false}
        onConfirm={() => {}}
        onAbort={() => {}}
      />
    );
    screen.rerender(
      <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />
    );
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('should clear the form and call onAbort when clicking the "Reset" button', async () => {
    const user = userEvent.setup();
    const onAbort = vi.fn();
    render(
      <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={onAbort} />
    );
    await user.fill(screen.getByRole('textbox'), 'Test');
    await user.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onAbort).toHaveBeenCalled();
    });
    expect(screen.queryByRole('textbox')).toHaveValue('');
  });

  describe('send for main category form', () => {
    it('should hide the category selection', async () => {
      const screen = render(
        <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />
      );
      const collapser = screen.getByTestId('CategorySelectCollapse');

      expect(collapser).toHaveAttribute('aria-hidden', 'true');
      expect(
        within(collapser).getByTestId('CategorySelect')
      ).toBeInTheDocument();
    });

    it('should create a main article with the given title', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn((createdCategory) => {
        expect(createdCategory.id).toEqual(666);
        expect(createdCategory.title).toEqual('Test');
        expect(createdCategory.isSidenav).toEqual(false);
        expect(createdCategory.category).toBeNull();
      });
      const screen = render(
        <CreateCategoryDialog
          isOpen
          onConfirm={onConfirm}
          onAbort={() => {}}
        />,
        {},
        { currentUser: SomeUser, additionalMocks: createMocks() }
      );
      await user.type(screen.getByRole('textbox'), 'Test');
      await user.click(screen.getByRole('button', { name: /erstellen/ }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe('send for subcategory', () => {
    it('should disable the submit button if no parentCategory is selected', async () => {
      const user = userEvent.setup();
      const screen = render(
        <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />,
        {},
        { currentUser: SomeUser }
      );

      await user.type(screen.getByRole('textbox'), 'Test');
      await user.click(screen.getByRole('radio', { name: /subnavigation/i }));
      expect(screen.getByRole('button', { name: /erstellen/ })).toBeDisabled();
    });

    it('should create an article', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn((createdCategory) => {
        expect(createdCategory.title).toEqual('Test');
        expect(createdCategory.isSidenav).toEqual(false);
        expect(createdCategory.category).toHaveProperty(
          'id',
          FaecherCategory.id
        );
      });

      const screen = render(
        <CreateCategoryDialog
          isOpen
          onConfirm={onConfirm}
          onAbort={() => {}}
        />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: createMocks({
            isSidenav: false,
            category: FaecherCategory,
          }),
        }
      );

      await user.type(screen.getByRole('textbox'), 'Test');
      await user.click(screen.getByRole('radio', { name: /subnavigation/i }));
      await new Promise((resolve) => setTimeout(resolve, 500));
      const select = screen.getByRole('button', {
        name: /übergeordnete kategorie/i,
      });
      await user.click(select);
      const faecherOption = await screen.findByRole('option', {
        name: /fächer/i,
      });
      await user.click(faecherOption);
      await user.click(screen.getByRole('button', { name: /erstellen/ }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe('send for sidenav', () => {
    it('should create an article', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn((createdCategory) => {
        expect(createdCategory.id).toEqual(666);
        expect(createdCategory.title).toEqual('Test');
        expect(createdCategory.isSidenav).toEqual(true);
        expect(createdCategory.category).toBeNull();
      });

      const screen = render(
        <CreateCategoryDialog
          isOpen
          onConfirm={onConfirm}
          onAbort={() => {}}
        />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: createMocks({ isSidenav: true }),
        }
      );

      await user.type(screen.getByRole('textbox'), 'Test');
      await user.click(screen.getByRole('radio', { name: /randnavigation/i }));
      await user.click(screen.getByRole('button', { name: /erstellen/ }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });
});
