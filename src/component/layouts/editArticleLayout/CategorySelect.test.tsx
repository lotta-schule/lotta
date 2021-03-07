import * as React from 'react';
import { render, waitFor } from 'test/util';
import { FaecherCategory, MaterialCategory } from 'test/fixtures';
import { CategorySelect } from './CategorySelect';
import userEvent from '@testing-library/user-event'

describe('component/layouts/editArticleLayout/CategorySelect', () => {

    it('should render the component', () => {
        render(<CategorySelect selectedCategory={FaecherCategory} onSelectCategory={() => {}} />);
    });

    it('should select the category', async () => {
        const onSelectCategory = jest.fn();
        const screen =
            render(<CategorySelect selectedCategory={null} onSelectCategory={onSelectCategory} />);
        userEvent.click(screen.getByRole('button', { name: /wählen/i }));
        userEvent.click(await screen.findByRole('option', { name: /material/i }));
        expect(onSelectCategory).toHaveBeenCalledWith(MaterialCategory);
    });

    it('should set the label via the label prop', async () => {
        const screen =
            render(<CategorySelect label={'Label'} selectedCategory={null} onSelectCategory={() => {}} />);
        expect(screen.getByText('Label')).toBeInstanceOf(HTMLLabelElement);
    });

    describe('option listing options', () => {
        it('show all categories as options', async () => {
            const screen =
                render(<CategorySelect selectedCategory={null} onSelectCategory={() => {}} />);
            userEvent.click(screen.getByRole('button', { name: /wählen/i }));
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(15);
            });
        });

        it('show all categories as options', async () => {
            const screen =
                render(<CategorySelect selectedCategory={null} onSelectCategory={() => {}} />);
            userEvent.click(screen.getByRole('button', { name: /wählen/i }));
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(15);
            });
        });

        it('should not show subcategories if hideSubCategories is given', async () => {
            const screen =
                render(<CategorySelect hideSubCategories selectedCategory={null} onSelectCategory={() => {}} />);
            userEvent.click(screen.getByRole('button', { name: /wählen/i }));
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(5);
            });
        });

        it('should not show sidenav categories if hideSidenav is given', async () => {
            const screen =
                render(<CategorySelect hideSidenav selectedCategory={null} onSelectCategory={() => {}} />);
            userEvent.click(screen.getByRole('button', { name: /wählen/i }));
            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(13);
            });
        });
    });
});
