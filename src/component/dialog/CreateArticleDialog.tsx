import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Dialog, Select, FormControl, InputLabel, Input, MenuItem, FormHelperText } from '@material-ui/core';
import { ArticleModel, CreateArticleModelInput } from '../../model';
import { Mutation } from 'react-apollo';
import { CreateArticleMutation } from 'api/mutation/CreateArticleMutation';
import { useCategories } from 'util/categories/useCategories';

export interface CreateArticleDialogProps {
    isOpen: boolean;
    onConfirm(article: ArticleModel): void;
    onAbort(): void;
}

export const CreateArticleDialog: FunctionComponent<CreateArticleDialogProps> = memo(({
    isOpen,
    onConfirm,
    onAbort
}) => {
    const categories = useCategories();
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const resetForm = () => {
        setTitle('');
        setCategoryId(null);
    }
    return (
        <Mutation<{ article: ArticleModel }, { article: CreateArticleModelInput }>
            mutation={CreateArticleMutation}
            fetchPolicy={'no-cache'}
        >{(createArticle, { data, error, loading: isLoading }) => {
            if (isOpen && data) {
                resetForm();
                onConfirm(data.article);
            }

            return (
                <Dialog open={isOpen} fullWidth>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createArticle({
                            variables: {
                                article: {
                                    title,
                                    categoryId,
                                    contentModules: []
                                }
                            }
                        });
                    }}>
                        <DialogTitle>Artikel Erstellen</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Gib zunächst Kategorie und Titel an.
                                </DialogContentText>
                            {error && (
                                <p style={{ color: 'red' }}>{error.message}</p>
                            )}
                            <TextField
                                autoFocus
                                margin="dense"
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={isLoading}
                                label="Titel des Artikels:"
                                placeholder="Mein neuer Artikel"
                                type="text"
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel shrink htmlFor="category-id-placeholder">
                                    Kategorie
                                </InputLabel>
                                <Select
                                    value={categoryId || ''}
                                    onChange={({ target }) => setCategoryId((target.value as string) || null)}
                                    input={<Input name="category-id" id="category-id-placeholder" />}
                                    displayEmpty
                                    fullWidth
                                    name="category-id"
                                >
                                    <MenuItem value="">
                                        <em>Keine Kategorie</em>
                                    </MenuItem>
                                    {categories.map(category => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Label + Platzhalter</FormHelperText>
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
                                disabled={isLoading}
                                color="secondary"
                                variant="contained">
                                Artikel erstellen
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            );
        }}</Mutation>
    );
});