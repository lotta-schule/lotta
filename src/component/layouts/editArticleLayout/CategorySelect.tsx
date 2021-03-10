import * as React from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput,
} from '@material-ui/core';

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

        const inputLabel = React.useRef<HTMLLabelElement>(null);
        const [labelWidth, setLabelWidth] = React.useState(0);

        React.useEffect(() => {
            setLabelWidth(inputLabel.current!.offsetWidth);
        }, []);

        const mainCategories = categories.filter(
            (c) =>
                !c.category && !c.isHomepage && (!c.isSidenav || !hideSidenav)
        );

        const getMenuItemForCategory = React.useCallback(
            (category: CategoryModel) => (
                <MenuItem key={category.id} value={category.id}>
                    {!category.category && !hideSubCategories && (
                        <strong>{category.title}</strong>
                    )}
                    {(category.category || hideSubCategories) && (
                        <span
                            style={
                                category.category
                                    ? { paddingLeft: '1.5em' }
                                    : undefined
                            }
                        >
                            {category.title}
                        </span>
                    )}
                </MenuItem>
            ),
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
                <InputLabel
                    ref={inputLabel}
                    htmlFor={'outlined-category-select'}
                >
                    {label ?? 'Kategorie:'}
                </InputLabel>
                <Select
                    fullWidth
                    variant={'outlined'}
                    value={selectedCategory?.id ?? 'null'}
                    onChange={(e) =>
                        onSelectCategory(
                            categories.find(
                                (cat) =>
                                    e.target.value !== 'null' &&
                                    cat.id === e.target.value
                            ) || null
                        )
                    }
                    input={
                        <OutlinedInput
                            labelWidth={labelWidth}
                            name={'category'}
                            id={'outlined-category-select'}
                        />
                    }
                >
                    <MenuItem key={'null'} value={'null'}>
                        <i>Kategorie wählen</i>
                    </MenuItem>
                    {menuItems}
                </Select>
            </FormControl>
        );
    }
);
