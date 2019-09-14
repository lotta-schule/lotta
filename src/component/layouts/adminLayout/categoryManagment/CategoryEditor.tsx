import React, { memo, useState, useEffect, useCallback } from 'react';
import {
    Typography, makeStyles, Theme, TextField, FormControl, InputLabel, Select, MenuItem, Button, Checkbox, FormControlLabel, Divider
} from '@material-ui/core';
import { CategoryModel } from 'model';
import { GroupSelect } from 'component/layouts/editArticle/GroupSelect';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import Img from 'react-cloudimage-responsive';
import { useCategories } from 'util/categories/useCategories';
import { useMutation } from 'react-apollo';
import { UpdateCategoryMutation } from 'api/mutation/UpdateCategoryMutation';
import { ID } from 'model/ID';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';

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
}


export const CategoryEditor = memo<CategoryEditorProps>(({ selectedCategory }) => {

    const styles = useStyles();

    const categories = useCategories();

    const [category, setCategory] = useState<CategoryModel | null>(null);

    const [mutateCategory, { loading: isLoading, error }] = useMutation<{ category: CategoryModel }, { id: ID, category: Partial<CategoryModel> }>(UpdateCategoryMutation);

    const updateCategory = useCallback(async () => {
        if (!selectedCategory || !category) {
            return null;
        }
        mutateCategory({
            variables: {
                id: selectedCategory.id,
                category: {
                    sortKey: selectedCategory.sortKey,
                    title: category.title,
                    bannerImageFile: category.bannerImageFile,
                    group: category.group,
                    redirect: category.redirect,
                    hideArticlesFromHomepage: category.hideArticlesFromHomepage || false,
                    widgets: category.widgets ? category.widgets.map(w => ({ ...w, configuration: JSON.stringify(w.configuration) })) : []
                }
            }
        });
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
            {error && (
                <div style={{ color: 'red' }}>{error.message}</div>
            )}
            <TextField
                className={styles.input}
                fullWidth
                label="Name der Kategorie"
                value={category.title}
                onChange={e => setCategory({ ...category, title: e.target.value })}
            />

            <GroupSelect
                className={styles.input}
                selectedGroup={category.group || null}
                onSelectGroup={group => setCategory({ ...category, group: group || undefined })}
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
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={category.hideArticlesFromHomepage}
                            onChange={(_, checked) => setCategory({ ...category, hideArticlesFromHomepage: checked })}
                            value={'hideArticlesFromHomepage'}
                        />
                    }
                    label={'Beiträge dieser Kategorie auf der Startseite verstecken'}
                />
            </FormControl>

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
            <Divider />
            <p>&nbsp;</p>
            <CategoryWidgetSelector
                selectedWidgets={category.widgets || []}
                setSelectedWidgets={widgets => setCategory({ ...category, widgets })}
            />
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