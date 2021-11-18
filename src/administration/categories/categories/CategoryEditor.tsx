import * as React from 'react';
import { FormControl, Checkbox, FormControlLabel } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useMutation, useQuery } from '@apollo/client';
import { animated, useSpring } from 'react-spring';
import { CategoryModel, WidgetModel, ID } from 'model';
import { useCategories } from 'util/categories/useCategories';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { Button } from 'shared/general/button/Button';
import { Divider } from 'shared/general/divider/Divider';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { Radio, RadioGroup } from 'shared/general/form/radio';
import { Select } from 'shared/general/form/select/Select';
import { useServerData } from 'shared/ServerDataContext';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { Category, File, RedirectType } from 'util/model';
import { CategoryWidgetSelector } from './CategoryWidgetSelector';
import Img from 'react-cloudimage-responsive';
import clsx from 'clsx';

import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';

import styles from './CategoryEditor.module.scss';

export interface CategoryEditorProps {
    selectedCategory: CategoryModel | null;
    onSelectCategory(category: CategoryModel | null): void;
}

export const CategoryEditor = React.memo<CategoryEditorProps>(
    ({ selectedCategory, onSelectCategory }) => {
        const { baseUrl } = useServerData();

        const [categories] = useCategories();

        const [category, setCategory] = React.useState<CategoryModel | null>(
            null
        );
        const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
            React.useState(false);

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
        const { data: currentWidgetsData, error: currentWidgetsError } =
            useQuery(GetCategoryWidgetsQuery, {
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
                <h3 className={styles.title}>
                    {selectedCategory
                        ? selectedCategory.title
                        : category && category.title}
                </h3>
                <ErrorMessage error={error || currentWidgetsError} />
                <Label label={'Name der Kategorie'}>
                    <Input
                        className={styles.input}
                        aria-label={'Name der Kategorie'}
                        value={category.title}
                        onChange={(e) =>
                            setCategory({
                                ...category,
                                title: e.currentTarget.value,
                            })
                        }
                    />
                </Label>

                {!category.isHomepage && (
                    <GroupSelect
                        className={styles.input}
                        selectedGroups={category.groups || []}
                        onSelectGroups={(groups) =>
                            setCategory({ ...category, groups })
                        }
                    />
                )}

                <h4 className={clsx(styles.input, styles.heading)}>
                    Wähle ein Banner für diese Kategorie
                </h4>

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
                                baseUrl,
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
                                                hideArticlesFromHomepage:
                                                    checked,
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
                    <Label label={'Layout für die Kategorie wählen'}>
                        <Select
                            value={category.layoutName ?? 'standard'}
                            onChange={({ currentTarget }) =>
                                setCategory({
                                    ...category,
                                    layoutName: currentTarget.value as any,
                                })
                            }
                            id={'category-layout'}
                        >
                            <option value={'standard'}>Standardlayout</option>
                            <option value={'densed'}>Kompaktlayout</option>
                            <option value={'2-columns'}>
                                Zweispaltenlayout
                            </option>
                        </Select>
                    </Label>
                </FormControl>

                {!category.isHomepage && (
                    <>
                        <h4 className={clsx(styles.input, styles.heading)}>
                            Die Kategorie als Weiterleitung
                        </h4>

                        <RadioGroup
                            name={'category-redirect-type'}
                            aria-label={'Die Kategorie als Weiterleitung'}
                            value={Category.getRedirectType(category)}
                            onChange={(_e, value) => {
                                if (value === RedirectType.None) {
                                    setCategory({
                                        ...category,
                                        redirect: null,
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
                            <Radio
                                value={RedirectType.None}
                                label={
                                    'Kategorie wird nicht weitergeleitet und zeigt eigene Beiträge an.'
                                }
                            />
                            <Radio
                                value={RedirectType.Intern}
                                label={
                                    'Kategorie zu einer anderen Kategorie weiterleiten:'
                                }
                            />

                            <animated.div
                                data-testid={'InternalRedirectWrapper'}
                                style={redirectInternallySpringProps}
                            >
                                <FormControl className={styles.input}>
                                    <Label
                                        label={
                                            'Zu einer anderen Kategorie weiterleiten ...'
                                        }
                                    >
                                        <Select
                                            value={category.redirect || 'null'}
                                            onChange={({ currentTarget }) =>
                                                setCategory({
                                                    ...category,
                                                    redirect:
                                                        currentTarget.value,
                                                })
                                            }
                                            id={'category-redirect'}
                                        >
                                            <option key={0} />
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={Category.getPath(
                                                        category
                                                    )}
                                                >
                                                    {category.title}
                                                </option>
                                            ))}
                                        </Select>
                                    </Label>
                                </FormControl>
                            </animated.div>

                            <Radio
                                value={RedirectType.Extern}
                                label={
                                    'Kategorie zu einer Seite im Internet weiterleiten'
                                }
                            />

                            <animated.div
                                data-testid={'ExternalRedirectWrapper'}
                                style={redirectExternallySpringProps}
                            >
                                <Label label={'Ziel der Weiterleitung:'}>
                                    <Input
                                        className={styles.input}
                                        aria-label={'Ziel der Weiterleitung'}
                                        value={category.redirect as string}
                                        onChange={(e) =>
                                            setCategory({
                                                ...category,
                                                redirect: e.currentTarget.value,
                                            })
                                        }
                                    />
                                </Label>
                            </animated.div>
                        </RadioGroup>

                        <p>&nbsp;</p>
                    </>
                )}

                <h4 className={clsx(styles.input, styles.heading)}>
                    Wähle die marginalen Module für diese Kategorie
                </h4>
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
                            onRequestClose={() =>
                                setIsDeleteCategoryDialogOpen(false)
                            }
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
