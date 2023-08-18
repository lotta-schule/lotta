import * as React from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import { Label, Select } from '@lotta-schule/hubert';

export interface CategorySelectProps {
    disabled?: boolean;
    className?: string;
    label?: string;
    hideSubCategories?: boolean;
    hideSidenav?: boolean;
    selectedCategory: CategoryModel | null;
    onSelectCategory(category: CategoryModel | null): void;
}

export const CategorySelect = React.memo<CategorySelectProps>(
    ({
        disabled,
        label,
        hideSubCategories,
        hideSidenav,
        selectedCategory,
        onSelectCategory,
        className,
    }) => {
        const [categories] = useCategories();

        const mainCategories = categories.filter(
            (c) =>
                !c.category && !c.isHomepage && (!c.isSidenav || !hideSidenav)
        );

        const getMenuItemForCategory = React.useCallback(
            (category: CategoryModel) => {
                const label =
                    !category.category && !hideSubCategories
                        ? category.title
                        : `${category.category ? '\xa0 \xa0 \xa0' : ''}${
                              category.title
                          }`;
                return (
                    <option key={category.id} value={category.id}>
                        {label}
                    </option>
                );
            },
            [hideSubCategories]
        );

        const menuItems = mainCategories
            .map((category) =>
                hideSubCategories
                    ? [category]
                    : [category].concat(
                          categories.filter(
                              (c) => c.category?.id === category.id
                          )
                      )
            )
            .flat()
            .map(getMenuItemForCategory);

        return (
            <Label
                label={label ?? 'Kategorie wählen:'}
                data-testid="CategorySelect"
                className={className}
            >
                <Select
                    title="Kategorie wählen"
                    disabled={disabled}
                    value={selectedCategory?.id ?? 'null'}
                    onChange={(e) =>
                        onSelectCategory(
                            categories.find(
                                (cat) =>
                                    e.currentTarget.value !== 'null' &&
                                    cat.id === e.currentTarget.value
                            ) || null
                        )
                    }
                >
                    <option key={'null'} value={'null'}>
                        Kategorie wählen
                    </option>
                    {menuItems}
                </Select>
            </Label>
        );
    }
);
CategorySelect.displayName = 'CategorySelect';
