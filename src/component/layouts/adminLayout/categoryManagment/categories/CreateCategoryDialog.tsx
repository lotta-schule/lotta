import * as React from 'react';
import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    makeStyles,
    LinearProgress,
} from '@material-ui/core';
import { CategoryModel } from 'model';
import { CreateCategoryMutation } from 'api/mutation/CreateCategoryMutation';
import { useMutation } from '@apollo/client';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { CategorySelect } from '../../../editArticleLayout/CategorySelect';
import { animated, useSpring } from 'react-spring';

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
        const [
            parentCategory,
            setParentCategory,
        ] = React.useState<CategoryModel | null>(null);
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
                        <TextField
                            margin="dense"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            label="Name der Kategorie:"
                            placeholder="Meine neue Kategorie"
                            type="text"
                            autoFocus
                            required
                            fullWidth
                        />
                        <FormControl
                            className={styles.categoryPositionSet}
                            component={'fieldset'}
                        >
                            <FormLabel component={'legend'}>
                                Art der Kategorie
                            </FormLabel>
                            <RadioGroup
                                aria-label={'Art der Kategorie'}
                                value={categoryPosition}
                                onChange={(_e, value) =>
                                    setCategoryPosition(parseInt(value, 10))
                                }
                            >
                                <FormControlLabel
                                    value={0}
                                    control={<Radio />}
                                    label={'Hauptkategorie'}
                                />
                                <FormControlLabel
                                    value={1}
                                    control={<Radio />}
                                    label={'Unterkategorie'}
                                />
                                <animated.div style={parentCategorySpringProps}>
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
                                <FormControlLabel
                                    value={2}
                                    control={<Radio />}
                                    label={'Seitenleistenkategorie'}
                                />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                resetForm();
                                onAbort();
                            }}
                            color="secondary"
                            variant="outlined"
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
                            color="secondary"
                            variant="contained"
                        >
                            Kategorie erstellen
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
