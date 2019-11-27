import React, { FunctionComponent, memo } from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { find } from 'lodash';

export interface CategorySelectProps {
    disabled?: boolean;
    onlyMainCategories?: boolean;
    selectedCategory: CategoryModel | null;
    onSelectCategory(category: CategoryModel | null): void;
}

export const CategorySelect: FunctionComponent<CategorySelectProps> = memo(({ disabled, onlyMainCategories, selectedCategory, onSelectCategory }) => {
    const [categories] = useCategories();

    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    const mainCategoriesFilter = onlyMainCategories ?
        (category: CategoryModel) => !category.category :
        () => true;

    return (
        <FormControl disabled={disabled} variant="outlined" fullWidth>
            <InputLabel ref={inputLabel} htmlFor="outlined-category-select">
                Kategorie:
            </InputLabel>
            <Select
                fullWidth
                variant="outlined"
                value={selectedCategory ? selectedCategory.id : 'null'}
                onChange={e => onSelectCategory(find(categories, cat => e.target.value !== 'null' && cat.id === e.target.value) || null)}
                input={<OutlinedInput labelWidth={labelWidth} name="category" id="outlined-category-select" />}
            >
                <MenuItem key={'null'} value={'null'}>Kategorie wählen</MenuItem>
                {categories.filter(mainCategoriesFilter).map(category => (
                    <MenuItem key={category.id} value={category.id}>
                        {category.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});