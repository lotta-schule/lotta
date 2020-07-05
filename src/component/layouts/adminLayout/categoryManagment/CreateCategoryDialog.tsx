import React, { FunctionComponent, memo, useState } from 'react';
import {
    Button, Checkbox, DialogTitle, DialogContent, DialogContentText, DialogActions, FormGroup, FormControlLabel, TextField
} from '@material-ui/core';
import { CategoryModel } from 'model';
import { CreateCategoryMutation } from 'api/mutation/CreateCategoryMutation';
import { useMutation } from '@apollo/client';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { CategorySelect } from '../../editArticleLayout/CategorySelect';

export interface CreateCategoryDialogProps {
    isOpen: boolean;
    onAbort(): void;
    onConfirm(category: CategoryModel): void;
}

export const CreateCategoryDialog: FunctionComponent<CreateCategoryDialogProps> = memo(({
    isOpen,
    onAbort,
    onConfirm
}) => {
    const [title, setTitle] = useState('');
    const [isSidenav, setIsSidenav] = useState(false);
    const [parentCategory, setParentCategory] = useState<CategoryModel | null>(null);
    const [createCategory, { loading: isLoading, error }] = useMutation<{ category: CategoryModel }, { category: any }>(CreateCategoryMutation, {
        update: (cache, { data }) => {
            let categories: CategoryModel[] = [];
            if (data && data.category) {
                const readCategoriesResult = cache.readQuery<{ categories: CategoryModel[] }>({ query: GetCategoriesQuery });
                if (readCategoriesResult && readCategoriesResult.categories) {
                    categories = [...readCategoriesResult.categories];
                }
                cache.writeQuery<{ categories: CategoryModel[] }>({
                    query: GetCategoriesQuery,
                    data: {
                        categories: [...categories, data.category]
                    }
                });
            }
        },
        onCompleted: ({ category }) => {
            onConfirm(category);
        }
    });
    const resetForm = () => {
        setTitle('');
    }
    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <form onSubmit={(e) => {
                e.preventDefault();
                createCategory({
                    variables: {
                        category: {
                            title,
                            isSidenav,
                            category: (!isSidenav && parentCategory) ? { id: parentCategory.id } : null
                        }
                    }
                });
            }}>
                <DialogTitle>Kategorie erstellen</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Erstelle eine neue Kategorie
                    </DialogContentText>
                    <ErrorMessage error={error} />
                    <TextField
                        margin="dense"
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={isLoading}
                        label="Name der Kategorie:"
                        placeholder="Meine neue Kategorie"
                        type="text"
                        autoFocus
                        required
                        fullWidth
                    />
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox disabled={isLoading} checked={isSidenav} onChange={(e, checked) => setIsSidenav(checked)} />}
                            label={'Seitenleisten-Kategorie'}
                        />
                    </FormGroup>

                    <CategorySelect
                        disabled={isLoading || isSidenav}
                        selectedCategory={parentCategory}
                        onSelectCategory={setParentCategory}
                    />
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
                        disabled={!title || isLoading}
                        color="secondary"
                        variant="contained"
                    >
                        Kategorie erstellen
                    </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    );
});
