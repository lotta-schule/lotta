import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { Label } from 'component/general/label/Label';
import { Input } from 'component/general/form/input/Input';
import { ArticleModel, ArticleModelInput } from '../../model';
import { CreateArticleMutation } from 'api/mutation/CreateArticleMutation';
import { useMutation } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';

export interface CreateArticleDialogProps {
    isOpen: boolean;
    onConfirm(article: ArticleModel): void;
    onAbort(): void;
}

export const CreateArticleDialog = React.memo<CreateArticleDialogProps>(
    ({ isOpen, onConfirm, onAbort }) => {
        const [title, setTitle] = React.useState('');
        const [createArticle, { loading: isLoading, error }] = useMutation<
            { article: ArticleModel },
            { article: Partial<ArticleModelInput> }
        >(CreateArticleMutation, {
            variables: { article: { title } },
            update: (cache, { data }) => {
                if (data && data.article) {
                    let ownArticles: ArticleModel[] = [];
                    try {
                        const readOwnArticlesResult = cache.readQuery<{
                            articles: ArticleModel[];
                        }>({ query: GetOwnArticlesQuery });
                        if (
                            readOwnArticlesResult &&
                            readOwnArticlesResult.articles
                        ) {
                            ownArticles = [...readOwnArticlesResult.articles];
                        }
                    } catch (e) {
                        console.debug(e);
                    }
                    cache.writeQuery<{ articles: ArticleModel[] }>({
                        query: GetOwnArticlesQuery,
                        data: {
                            articles: [...ownArticles, data.article],
                        },
                    });
                }
            },
            onCompleted: ({ article }) => {
                onConfirm(article);
            },
        });
        const resetForm = () => {
            setTitle('');
        };
        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createArticle();
                    }}
                >
                    <DialogTitle>Beitrag erstellen</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Wähle zunächst einen Titel für deinen Beitrag
                        </DialogContentText>
                        <ErrorMessage error={error} />
                        <Label label="Titel des Beitrags:">
                            <Input
                                autoFocus
                                id="title"
                                value={title}
                                onChange={({ currentTarget }) =>
                                    setTitle(currentTarget.value)
                                }
                                disabled={isLoading}
                                placeholder="Mein neuer Beitrag"
                            />
                        </Label>
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
                        <Button type={'submit'} disabled={!title || isLoading}>
                            Beitrag erstellen
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
