import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core';
import { ArticleModel, ArticleModelInput } from '../../model';
import { CreateArticleMutation } from 'api/mutation/CreateArticleMutation';
import { useMutation } from '@apollo/react-hooks';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';

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
    const [title, setTitle] = useState('');
    const [createArticle, { loading: isLoading, error }] = useMutation<{ article: ArticleModel }, { article: Partial<ArticleModelInput> }>(CreateArticleMutation, {
        variables: { article: { title } },
        update: (cache, { data }) => {
            if (data && data.article) {
                let readOwnArticlesResult = [];
                try {
                    cache.readQuery<{ articles: ArticleModel[] }>({ query: GetOwnArticlesQuery });
                } catch (e) {
                    console.error(e);
                }
                const ownArticles = (readOwnArticlesResult && readOwnArticlesResult.articles) || [];
                cache.writeQuery<{ articles: ArticleModel[] }>({
                    query: GetOwnArticlesQuery,
                    data: {
                        articles: [...ownArticles, data.article]
                    }
                });
            }
        },
        onCompleted: ({ article }) => {
            onConfirm(article);
        }
    });
    const resetForm = () => {
        setTitle('');
    }
    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <form onSubmit={(e) => {
                e.preventDefault();
                createArticle();
            }}>
                <DialogTitle>Beitrag erstellen</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Wähle zunächst einen Titel für deinen Beitrag
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
                        label="Titel des Beitrags:"
                        placeholder="Mein neuer Beitrag"
                        type="text"
                        fullWidth
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
                        disabled={isLoading}
                        color="secondary"
                        variant="contained"
                    >
                        Artikel erstellen
                    </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    );
});