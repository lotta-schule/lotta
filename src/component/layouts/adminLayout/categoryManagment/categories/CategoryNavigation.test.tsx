import * as React from 'react';
import { render } from 'test/util';
import {
    allCategories,
    FaecherCategory,
    MatheCategory,
    StartseiteCategory,
} from 'test/fixtures';
import { CategoryNavigation } from './CategoryNavigation';
import userEvent from '@testing-library/user-event';

describe('component/layouts/adminLayout/categoryManagment/categories/CategoryNavigation', () => {
    const topLevelCategories = allCategories.filter((c) => !c.category);

    it('should render an CategoryNavigation without error', () => {
        render(
            <CategoryNavigation
                selectedCategory={null}
                onSelectCategory={() => {}}
            />,
            {}
        );
    });

    it('should render all top-level-categories', async () => {
        const screen = render(
            <CategoryNavigation
                selectedCategory={null}
                onSelectCategory={() => {}}
            />,
            {}
        );
        expect(
            await screen.findAllByRole('button', { expanded: false })
        ).toHaveLength(topLevelCategories.length);
    });

    describe('selected category', async () => {
        it('should select a category on click', async () => {
            const onSelectCategory = jest.fn();
            const screen = render(
                <CategoryNavigation
                    selectedCategory={null}
                    onSelectCategory={onSelectCategory}
                />,
                {}
            );
            userEvent.click(
                await screen.findByRole('button', { name: /start/i })
            );
            expect(onSelectCategory).toHaveBeenCalledWith(StartseiteCategory);
        });

        it('should show subtree when parent-tree is selected', async () => {
            const screen = render(
                <CategoryNavigation
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />,
                {}
            );
            expect(
                await screen.findByRole('button', {
                    name: /fächer/i,
                    expanded: true,
                })
            ).toBeVisible();
        });

        it('should show expanded tree if selected category is in it', async () => {
            const screen = render(
                <CategoryNavigation
                    selectedCategory={MatheCategory}
                    onSelectCategory={() => {}}
                />,
                {}
            );
            expect(
                await screen.findByRole('button', {
                    name: /fächer/i,
                    expanded: true,
                })
            ).toBeVisible();
        });
    });
});
