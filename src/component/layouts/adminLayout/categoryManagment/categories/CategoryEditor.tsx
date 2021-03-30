import * as React from 'react';
import {
    Divider,
    Typography,
    makeStyles,
    Theme,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Checkbox,
    FormControlLabel,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { CategoryModel, WidgetModel, ID } from 'model';
import { useMutation, useQuery } from '@apollo/client';
import { UpdateCategoryMutation } from 'api/mutation/UpdateCategoryMutation';
import { GroupSelect } from 'component/edit/GroupSelect';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useCategories } from 'util/categories/useCategories';
import { Category } from 'util/model';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { SaveButton } from 'component/general/SaveButton';
import { GetCategoryWidgetsQuery } from 'api/query/GetCategoryWidgetsQuery';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        marginTop: theme.spacing(3),
        width: '100%',
    },
    title: {
        marginBottom: theme.spacing(1),
    },
    switchBase: {
        color: 'gray',
    },
    saveButton: {
        float: 'right',
        marginBottom: theme.spacing(2),
    },
    deleteDivider: {
        clear: 'both',
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
}));

export interface CategoryEditorProps {
    selectedCategory: CategoryModel | null;
    onSelectCategory(category: CategoryModel | null): void;
}

export const CategoryEditor = React.memo<CategoryEditorProps>(
    ({ selectedCategory, onSelectCategory }) => {
        const styles = useStyles();

        const [categories] = useCategories();

        const [category, setCategory] = React.useState<CategoryModel | null>(
            null
        );
        const [
            isDeleteCategoryDialogOpen,
            setIsDeleteCategoryDialogOpen,
        ] = React.useState(false);

        const [isShowSuccess, setIsShowSuccess] = React.useState(false);
        const [selectedWidgets, setSelectedWidgets] = React.useState<
            WidgetModel[]
        >([]);
        const [mutateCategory, { loading: isLoading, error }] = useMutation<
            { category: CategoryModel },
            { id: ID; category: any }
        >(UpdateCategoryMutation, {
            refetchQueries: [
                {
                    query: GetCategoryWidgetsQuery,
                    variables: { categoryId: category?.id ?? null },
                },
            ],
            onCompleted: () => {
                setIsShowSuccess(true);
                setTimeout(() => setIsShowSuccess(false), 3000);
            },
        });
        const {
            data: currentWidgetsData,
            error: currentWidgetsError,
        } = useQuery(GetCategoryWidgetsQuery, {
            variables: { categoryId: category?.id ?? null },
            skip: !category?.id,
        });
        React.useEffect(() => {
            if (currentWidgetsData) {
                setSelectedWidgets(currentWidgetsData.widgets);
            }
        }, [currentWidgetsData]);

        const updateCategory = React.useCallback(async () => {
            if (!selectedCategory || !category) {
                return null;
            }
            mutateCategory({
                variables: {
                    id: selectedCategory.id,
                    category: {
                        title: category.title,
                        bannerImageFile: category.bannerImageFile && {
                            id: category.bannerImageFile.id,
                        },
                        groups: category.groups?.map(({ id }) => ({ id })),
                        redirect:
                            category.redirect === 'null'
                                ? null
                                : category.redirect,
                        layoutName: category.layoutName,
                        hideArticlesFromHomepage:
                            category.hideArticlesFromHomepage || false,
                        widgets:
                            selectedWidgets?.map(({ id }) => ({ id })) ?? [],
                    },
                },
            });
        }, [category, mutateCategory, selectedCategory, selectedWidgets]);

        React.useEffect(() => {
            if (selectedCategory === null && category !== null) {
                setCategory(null);
            } else if (selectedCategory) {
                if (!category || category.id !== selectedCategory.id) {
                    setCategory({ ...selectedCategory });
                }
            }
        }, [category, selectedCategory]);

        if (!category) {
            return null;
        }

        return (
            <>
                <Typography variant={'h5'} className={styles.title}>
                    {selectedCategory
                        ? selectedCategory.title
                        : category && category.title}
                </Typography>
                <ErrorMessage error={error || currentWidgetsError} />
                <TextField
                    fullWidth
                    className={styles.input}
                    label={'Name der Kategorie'}
                    inputProps={{ 'aria-label': 'Name der Kategorie' }}
                    value={category.title}
                    onChange={(e) =>
                        setCategory({ ...category, title: e.target.value })
                    }
                />

                {!category.isHomepage && (
                    <GroupSelect
                        className={styles.input}
                        selectedGroups={category.groups || []}
                        onSelectGroups={(groups) =>
                            setCategory({ ...category, groups })
                        }
                    />
                )}

                <Typography
                    className={clsx(styles.input, styles.title)}
                    variant={'h6'}
                >
                    Wähle ein Banner für diese Kategorie
                </Typography>

                <SelectFileOverlay
                    label={'Banner ändern'}
                    onSelectFile={(bannerImageFile) =>
                        setCategory({ ...category, bannerImageFile })
                    }
                    allowDeletion
                >
                    {category.bannerImageFile ? (
                        <Img
                            operation={'cover'}
                            size={'900x150'}
                            src={category.bannerImageFile.remoteLocation}
                        />
                    ) : (
                        <PlaceholderImage width={'100%'} height={75} />
                    )}
                </SelectFileOverlay>

                {!category.isHomepage && (
                    <FormControl className={styles.input}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={category.hideArticlesFromHomepage}
                                    onChange={(_, checked) =>
                                        setCategory({
                                            ...category,
                                            hideArticlesFromHomepage: checked,
                                        })
                                    }
                                    value={'hideArticlesFromHomepage'}
                                />
                            }
                            label={
                                'Beiträge dieser Kategorie auf der Startseite verstecken'
                            }
                        />
                    </FormControl>
                )}

                <FormControl className={styles.input}>
                    <InputLabel htmlFor={'category-layout'}>
                        Layout für die Kategorie wählen
                    </InputLabel>
                    <Select
                        value={category.layoutName ?? 'standard'}
                        onChange={({ target }) =>
                            setCategory({
                                ...category,
                                layoutName: target.value as any,
                            })
                        }
                        inputProps={{
                            id: 'category-layout',
                        }}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value={'standard'}>Standardlayout</MenuItem>
                        <MenuItem value={'densed'}>Kompaktlayout</MenuItem>
                        <MenuItem value={'2-columns'}>
                            Zweispaltenlayout
                        </MenuItem>
                    </Select>
                </FormControl>

                {!category.isHomepage && (
                    <>
                        <FormControl className={styles.input}>
                            <InputLabel htmlFor={'category-redirect'}>
                                Zu einer anderen Kategorie weiterleiten ...
                            </InputLabel>
                            <Select
                                value={category.redirect || 'null'}
                                onChange={({ target }) =>
                                    setCategory({
                                        ...category,
                                        redirect: target.value as string,
                                    })
                                }
                                inputProps={{
                                    id: 'category-redirect',
                                }}
                                displayEmpty
                                fullWidth
                            >
                                <MenuItem value={'null'}>
                                    <em>Nicht weiterleiten</em>
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem
                                        key={category.id}
                                        value={Category.getPath(category)}
                                    >
                                        {category.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <p>&nbsp;</p>
                    </>
                )}

                <Typography
                    className={clsx(styles.input, styles.title)}
                    variant={'h6'}
                >
                    Wähle die marginalen Module für diese Kategorie
                </Typography>
                <CategoryWidgetSelector
                    selectedWidgets={selectedWidgets}
                    setSelectedWidgets={(widgets) =>
                        setSelectedWidgets(widgets)
                    }
                />
                <p>&nbsp;</p>
                <SaveButton
                    className={styles.saveButton}
                    isLoading={isLoading}
                    isSuccess={isShowSuccess}
                    onClick={() => updateCategory()}
                >
                    Kategorie speichern
                </SaveButton>

                {!category.isHomepage && (
                    <>
                        <Divider className={styles.deleteDivider} />
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<Delete />}
                            onClick={() => setIsDeleteCategoryDialogOpen(true)}
                        >
                            Kategorie löschen
                        </Button>
                        <DeleteCategoryDialog
                            isOpen={isDeleteCategoryDialogOpen}
                            categoryToDelete={category}
                            onClose={() => setIsDeleteCategoryDialogOpen(false)}
                            onConfirm={() => {
                                setIsDeleteCategoryDialogOpen(false);
                                onSelectCategory(null);
                            }}
                        />
                    </>
                )}
            </>
        );
    }
);
