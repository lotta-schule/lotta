import React, { FunctionComponent, memo } from 'react';
import { useCategories } from 'util/categories/useCategories';
import { CategoryModel } from 'model';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { find } from 'lodash';
import { ID } from 'model/ID';

export interface CategorySelectProps {
    selectedCategoryId?: ID;
    onSelectCategory(category?: CategoryModel): void;
}

export const CategorySelect: FunctionComponent<CategorySelectProps> = memo(({ selectedCategoryId, onSelectCategory }) => {
    const categories = useCategories();

    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel ref={inputLabel} htmlFor="outlined-category-select">
                Kategorie:
            </InputLabel>
            <Select
                fullWidth
                variant="outlined"
                value={selectedCategoryId}
                onChange={e => onSelectCategory(find(categories, cat => cat.id === e.target.value))}
                input={<OutlinedInput labelWidth={labelWidth} name="category" id="outlined-category-select" />}
            >
                <MenuItem key={'undefined'} value={undefined}></MenuItem>
                {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                        {category.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});