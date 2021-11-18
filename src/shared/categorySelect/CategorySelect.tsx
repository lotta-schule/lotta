import * as React from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import { FormControl } from '@material-ui/core';
import { Label } from 'shared/general/label/Label';
import { Select } from 'shared/general/form/select/Select';

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
            <FormControl
                disabled={disabled}
                variant={'outlined'}
                fullWidth
                data-testid="CategorySelect"
                className={className}
            >
                <Label label={label ?? 'Kategorie wählen:'}>
                    <Select
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
            </FormControl>
        );
    }
);
CategorySelect.displayName = 'CategorySelect';
