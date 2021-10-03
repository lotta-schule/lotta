import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    makeStyles,
    LinearProgress,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { CategoryModel } from 'model';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { CategorySelect } from '../../../editArticleLayout/CategorySelect';
import { animated, useSpring } from 'react-spring';
import { Label } from 'component/general/label/Label';
import { Input } from 'component/general/form/input/Input';
import { Radio, RadioGroup } from 'component/general/form/radio';
import CreateCategoryMutation from 'api/mutation/CreateCategoryMutation.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

enum CategoryPosition {
    Main,
    Sub,
    Side,
}

export interface CreateCategoryDialogProps {
    isOpen: boolean;
    onAbort(): void;
    onConfirm(category: CategoryModel): void;
}

const useStyles = makeStyles((theme) => ({
    categoryPositionSet: {
        marginTop: theme.spacing(3),
        width: '100%',
    },
    categorySelect: {
        margin: theme.spacing(1, 0),
    },
}));

export const CreateCategoryDialog = React.memo<CreateCategoryDialogProps>(
    ({ isOpen, onAbort, onConfirm }) => {
        const styles = useStyles();

        const [title, setTitle] = React.useState('');
        const [categoryPosition, setCategoryPosition] = React.useState(
            CategoryPosition.Main
        );
        const [parentCategory, setParentCategory] =
            React.useState<CategoryModel | null>(null);
        const [createCategory, { loading: isLoading, error }] = useMutation<
            { category: CategoryModel },
            { category: any }
        >(CreateCategoryMutation, {
            update: (cache, { data }) => {
                let categories: CategoryModel[] = [];
                if (data && data.category) {
                    const readCategoriesResult = cache.readQuery<{
                        categories: CategoryModel[];
                    }>({ query: GetCategoriesQuery });
                    if (
                        readCategoriesResult &&
                        readCategoriesResult.categories
                    ) {
                        categories = [...readCategoriesResult.categories];
                    }
                    cache.writeQuery<{ categories: CategoryModel[] }>({
                        query: GetCategoriesQuery,
                        data: {
                            categories: [...categories, data.category],
                        },
                    });
                }
            },
            onCompleted: ({ category }) => {
                onConfirm(category);
            },
        });
        const parentCategorySpringProps = useSpring({
            overflow: 'hidden',
            height: categoryPosition === CategoryPosition.Sub ? 70 : 0,
        });
        const resetForm = () => {
            setTitle('');
        };

        React.useEffect(() => {
            resetForm();
        }, [isOpen]);

        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                {isLoading && <LinearProgress />}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createCategory({
                            variables: {
                                category: {
                                    title,
                                    isSidenav:
                                        categoryPosition ===
                                        CategoryPosition.Side,
                                    category:
                                        categoryPosition !==
                                            CategoryPosition.Side &&
                                        parentCategory
                                            ? { id: parentCategory.id }
                                            : null,
                                },
                            },
                        });
                    }}
                >
                    <DialogTitle>Kategorie erstellen</DialogTitle>
                    <DialogContent>
                        <ErrorMessage error={error} />
                        <Label label="Name der Kategorie:">
                            <Input
                                id="title"
                                value={title}
                                onChange={({ currentTarget }) =>
                                    setTitle(currentTarget.value)
                                }
                                disabled={isLoading}
                                placeholder="Meine neue Kategorie"
                                autoFocus
                                required
                            />
                        </Label>
                        <FormControl
                            className={styles.categoryPositionSet}
                            component={'fieldset'}
                        >
                            <Label label={'Art der Kategorie'}>
                                <RadioGroup
                                    name={'category-type'}
                                    aria-label={'Art der Kategorie'}
                                    value={categoryPosition}
                                    onChange={(_e, value) =>
                                        setCategoryPosition(parseInt(value, 10))
                                    }
                                >
                                    <Radio
                                        value={CategoryPosition.Main}
                                        label={'Hauptkategorie'}
                                    />
                                    <Radio
                                        value={CategoryPosition.Sub}
                                        label={'Unterkategorie'}
                                    />
                                    <animated.div
                                        style={parentCategorySpringProps}
                                    >
                                        <CategorySelect
                                            hideSubCategories
                                            className={styles.categorySelect}
                                            label={'Übergeordnete Kategorie'}
                                            disabled={
                                                categoryPosition !==
                                                    CategoryPosition.Sub &&
                                                !isLoading
                                            }
                                            selectedCategory={parentCategory}
                                            onSelectCategory={setParentCategory}
                                        />
                                    </animated.div>
                                    <Radio
                                        value={CategoryPosition.Side}
                                        label={'Seitenleistenkategorie'}
                                    />
                                </RadioGroup>
                            </Label>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                resetForm();
                                onAbort();
                            }}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type={'submit'}
                            disabled={
                                !title ||
                                isLoading ||
                                (categoryPosition === CategoryPosition.Sub &&
                                    !parentCategory)
                            }
                        >
                            Kategorie erstellen
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
