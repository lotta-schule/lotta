import React, { memo, useState, useEffect, useCallback } from 'react';
import {
    Typography, makeStyles, Theme, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@material-ui/core';
import { CategoryModel } from 'model';
import { GroupSelect } from 'component/layouts/editArticle/GroupSelect';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import Img from 'react-cloudimage-responsive';
import { useUserGroups } from 'util/client/useUserGroups';
import { find } from 'lodash';
import { useCategories } from 'util/categories/useCategories';

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    switchBase: {
        color: 'gray'
    }
}));

export interface CategoryEditorProps {
    selectedCategory: CategoryModel | null;
    mutateCategory(updatedCategory: Partial<CategoryModel>): Promise<void>;
}


export const CategoryEditor = memo<CategoryEditorProps>(({ selectedCategory, mutateCategory }) => {

    const styles = useStyles();

    const groups = useUserGroups();
    const categories = useCategories();

    const [category, setCategory] = useState<CategoryModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const updateCategory = useCallback(async () => {
        if (!selectedCategory || !category) {
            return null;
        }
        setIsLoading(true);
        try {
            await mutateCategory({
                id: selectedCategory.id,
                sortKey: selectedCategory.sortKey,
                title: category.title,
                bannerImageFile: category.bannerImageFile,
                group: category.group,
                redirect: category.redirect
            });
        } finally {
            setIsLoading(false);
        }
    }, [category, mutateCategory, selectedCategory]);

    useEffect(() => {
        if (selectedCategory === null && category !== null) {
            setCategory(null);
        } else if (selectedCategory) {
            if (!category || category.id !== selectedCategory.id) {
                setCategory({ ...selectedCategory });
            }
        }
    }, [category, selectedCategory])

    if (!category) {
        return null;
    }

    return (
        <>
            <Typography variant="h5">
                {selectedCategory ? selectedCategory.title : category && category.title}
            </Typography>
            <TextField
                className={styles.input}
                fullWidth
                label="Name der Kategorie"
                value={category.title}
                onChange={e => setCategory({ ...category, title: e.target.value })}
            />

            <GroupSelect
                className={styles.input}
                selectedGroupId={category.group && category.group.id}
                onSelectGroupId={id => {
                    return setCategory({ ...category, group: find(groups, { id }) });
                }}
            />

            <Typography className={styles.input}>
                <b>Wähle ein Banner für diese Kategorie</b>
            </Typography>

            <SelectFileOverlay label={'Banner ändern'} onSelectFile={bannerImageFile => setCategory({ ...category, bannerImageFile })}>
                {category.bannerImageFile ? (
                    <Img operation={'cover'} size={'900x150'} src={category.bannerImageFile.remoteLocation} />
                ) : (<PlaceholderImage width={'100%'} height={75} />)}
            </SelectFileOverlay>

            <FormControl className={styles.input}>
                <InputLabel htmlFor={'category-redirect'}>Zu einer anderen Kategorie weiterleiten ...</InputLabel>
                <Select
                    value={category.redirect}
                    onChange={({ target }) => setCategory({ ...category, redirect: target.value as string })}
                    inputProps={{
                        id: 'category-redirect'
                    }}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value={undefined}>
                    </MenuItem>
                    {categories.map(category => (
                        <MenuItem key={category.id} value={`/category/${category.id}`}>
                            {category.title}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <p>&nbsp;</p>
            <Button
                style={{ float: 'right' }}
                disabled={isLoading}
                variant={'contained'}
                color={'secondary'}
                onClick={() => updateCategory()}
            >
                Kategorie speichern
            </Button>

            {/* <Divider style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(2) }} />
            <Button size="small" variant="contained" color="secondary" className={styles.button}>
                <Delete className={classNames(styles.leftIcon, styles.iconSmall)} />
                Kategorie löschen
            </Button>
            <Typography>
                (Achtung: kann im Nachhinein nicht mehr rückgängig gemacht werden!)
            </Typography> */}
        </>
    );

});