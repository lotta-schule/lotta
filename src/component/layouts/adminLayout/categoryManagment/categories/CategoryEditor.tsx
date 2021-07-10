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
    Checkbox,
    FormControlLabel,
    RadioGroup,
    Radio,
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
import { Category, File, RedirectType } from 'util/model';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { GetCategoryWidgetsQuery } from 'api/query/GetCategoryWidgetsQuery';
import { Button } from 'component/general/button/Button';
import { animated, useSpring } from 'react-spring';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        marginTop: theme.spacing(1.5),
        width: '100%',
    },
    title: {
        marginTop: theme.spacing(5),
        paddingTop: theme.spacing(3),
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

        const updateCategory = React.useCallback(() => {
            if (!selectedCategory || !category) {
                return null;
            }
            return mutateCategory({
                variables: {
                    id: selectedCategory.id,
                    category: {
                        title: category.title,
                        bannerImageFile: category.bannerImageFile && {
                            id: category.bannerImageFile.id,
                        },
                        groups: category.groups?.map(({ id }) => ({ id })),
                        redirect: category.redirect,
                        layoutName: category.layoutName,
                        hideArticlesFromHomepage:
                            category.hideArticlesFromHomepage || false,
                        widgets:
                            selectedWidgets?.map(({ id }) => ({ id })) ?? [],
                    },
                },
            });
        }, [category, mutateCategory, selectedCategory, selectedWidgets]);

        const redirectInternallySpringProps = useSpring({
            overflow: 'hidden',
            height:
                Category.getRedirectType(category) === RedirectType.Intern
                    ? 70
                    : 0,
        });
        const redirectExternallySpringProps = useSpring({
            overflow: 'hidden',
            height:
                Category.getRedirectType(category) === RedirectType.Extern
                    ? 70
                    : 0,
        });

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
                            src={File.getFileRemoteLocation(
                                category.bannerImageFile
                            )}
                        />
                    ) : (
                        <PlaceholderImage width={'100%'} height={75} />
                    )}
                </SelectFileOverlay>

                {!category.isHomepage && (
                    <>
                        <FormControl className={styles.input}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            category.hideArticlesFromHomepage
                                        }
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
                    </>
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
                        <Typography
                            className={clsx(styles.input, styles.title)}
                            variant={'h6'}
                        >
                            Die Kategorie als Weiterleitung
                        </Typography>

                        <RadioGroup
                            aria-label={'Die Kategorie als Weiterleitung'}
                            value={Category.getRedirectType(category)}
                            onChange={(_e, value) => {
                                if (value === RedirectType.None) {
                                    setCategory({
                                        ...category,
                                        redirect: undefined,
                                    });
                                }
                                if (value === RedirectType.Intern) {
                                    setCategory({
                                        ...category,
                                        redirect: Category.getPath(
                                            categories[0]
                                        ),
                                    });
                                }
                                if (value === RedirectType.Extern) {
                                    setCategory({
                                        ...category,
                                        redirect: 'https://lotta.schule',
                                    });
                                }
                            }}
                        >
                            <FormControlLabel
                                value={RedirectType.None}
                                control={<Radio />}
                                label={
                                    'Kategorie wird nicht weitergeleitet und zeigt eigene Beiträge an.'
                                }
                            />
                            <FormControlLabel
                                value={RedirectType.Intern}
                                control={<Radio />}
                                label={
                                    'Kategorie zu einer anderen Kategorie weiterleiten:'
                                }
                            />

                            <animated.div
                                data-testid={'InternalRedirectWrapper'}
                                style={redirectInternallySpringProps}
                            >
                                <FormControl className={styles.input}>
                                    <InputLabel htmlFor={'category-redirect'}>
                                        Zu einer anderen Kategorie weiterleiten
                                        ...
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
                                        {categories.map((category) => (
                                            <MenuItem
                                                key={category.id}
                                                value={Category.getPath(
                                                    category
                                                )}
                                            >
                                                {category.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </animated.div>

                            <FormControlLabel
                                value={RedirectType.Extern}
                                control={<Radio />}
                                label={
                                    'Kategorie zu einer Seite im Internet weiterleiten'
                                }
                            />

                            <animated.div
                                data-testid={'ExternalRedirectWrapper'}
                                style={redirectExternallySpringProps}
                            >
                                <TextField
                                    fullWidth
                                    className={styles.input}
                                    label={'Ziel der Weiterleitung:'}
                                    inputProps={{
                                        'aria-label': 'Ziel der Weiterleitung',
                                    }}
                                    value={category.redirect}
                                    onChange={(e) =>
                                        setCategory({
                                            ...category,
                                            redirect: e.target.value,
                                        })
                                    }
                                />
                            </animated.div>
                        </RadioGroup>

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
                <Button
                    className={styles.saveButton}
                    disabled={isLoading}
                    onClick={() => updateCategory()}
                >
                    Kategorie speichern
                </Button>

                {!category.isHomepage && (
                    <>
                        <Divider className={styles.deleteDivider} />
                        <Button
                            icon={<Delete />}
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
