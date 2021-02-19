import * as React from 'react';
import { ArticleModel, ID } from '../../../model';
import { ArticleEditable as Article } from '../../article/ArticleEditable';
import { EditArticleSidebar } from './EditArticleSidebar';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { AddModuleBar } from 'component/article/AddModuleBar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article as ArticleUtil } from 'util/model/Article';
import { useMutation, useSubscription } from '@apollo/client';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import { ArticleIsUpdatedSubscription } from 'api/subscription/GetArticleSubscription';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import omit from 'lodash/omit';
import useRouter from 'use-react-router';

export interface ArticleLayoutProps {
    article: ArticleModel;
}

export const EditArticleLayout = React.memo<ArticleLayoutProps>(({ article }) => {
    const { history } = useRouter();
    const currentUser = useCurrentUser();

    const [editedArticle, setEditedArticle] = React.useState(article);
    const [isUpdatedArticleModalVisible, setIsUpdatedArticleModalVisible] = React.useState(false);
    React.useEffect(() => {
        if (article.id === editedArticle.id) {
            setEditedArticle({
                ...editedArticle,
                ...article,
                contentModules: editedArticle.contentModules
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [article]);
    const [saveArticle, { loading: isLoading, data: updatedArticleData }] = useMutation<{ article: ArticleModel }, { id: ID, article: any }>(UpdateArticleMutation, {
        onCompleted: ({ article }) => {
            if (article) {
                history.push(ArticleUtil.getPath(article));
            }
        }
    });
    useSubscription<{ article: ArticleModel }, { id: ID }>(ArticleIsUpdatedSubscription, {
        variables: { id: article.id },
        skip: isLoading || !!updatedArticleData?.article,
        onSubscriptionData: ({ client, subscriptionData: { data } }) => {
            if (data) {
                client.writeQuery({
                    query: GetArticleQuery,
                    variables: { id: article.id },
                    data
                });
                const updatedContentModules =
                    data.article.contentModules.filter(cm => {
                        const existingModule = editedArticle.contentModules.find(_cm => _cm.id === cm.id);
                        return existingModule && new Date(cm.updatedAt).getTime() > new Date(existingModule.updatedAt).getTime()
                    });
                const newContentModules = editedArticle.contentModules.filter(_cm => /^-/.test(_cm.id));
                if (newContentModules.length || updatedContentModules.length) {
                    setIsUpdatedArticleModalVisible(true);
                }
            }
        }
    });

    React.useEffect(() => {
        if (!currentUser) {
            history.push(ArticleUtil.getPath(article));
        }
    }, [article, currentUser, history]);

    return (
        <>
            <BaseLayoutMainContent>
                <Article
                    isEditModeEnabled
                    article={editedArticle}
                    onUpdateArticle={article => {
                        setEditedArticle(article);
                    }}
                />
                <AddModuleBar onAddModule={async contentModule => {
                    setEditedArticle({
                        ...editedArticle,
                        contentModules: [
                            ...editedArticle.contentModules,
                            {
                                configuration: {},
                                ...contentModule,
                                insertedAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                sortKey: editedArticle.contentModules.length ?
                                    Math.max(...editedArticle.contentModules.map(cm => cm.sortKey || 0)) + 10 :
                                    0,
                            }
                        ]
                    });
                }} />
                <ResponsiveFullScreenDialog open={isUpdatedArticleModalVisible}>
                    <DialogTitle>Beitrag wurde von einem anderen Nutzer aktualisiert.</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Module des Beitrags von einem Nutzer verändert.</DialogContentText>
                        <DialogContentText>Möchtest du den veränderten Beitrag laden? Allerdings gehen dadurch deine Änderungen verloren.</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsUpdatedArticleModalVisible(false)}>Nichts tun</Button>
                        <Button
                            color={'primary'}
                            onClick={() => {
                                setEditedArticle(article);
                                setIsUpdatedArticleModalVisible(false);
                            }}
                        >
                            Änderungen laden
                        </Button>
                    </DialogActions>
                </ResponsiveFullScreenDialog>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <EditArticleSidebar
                    article={editedArticle}
                    onUpdate={setEditedArticle}
                    isLoading={isLoading}
                    onSave={additionalProps => {
                        const article = {
                            ...omit(editedArticle, ['isPinnedToTop']) as ArticleModel,
                            ...additionalProps,
                            contentModules: editedArticle.contentModules.map(cm => ({
                                ...cm,
                                content: cm.content ? JSON.stringify(cm.content) : cm.content,
                                configuration: JSON.stringify(cm.configuration || {})
                            }))
                        };
                        saveArticle({
                            variables: {
                                id: article.id,
                                article: {
                                    ...omit(article, ['id']),
                                    contentModules: article.contentModules.map(cm =>
                                        ({
                                            ...omit(cm,
                                                ...(/^-/.test(cm.id) ? ['id'] : []),
                                                'updatedAt',
                                                'insertedAt'
                                            ),
                                            content: cm.content || null,
                                            files: cm.files?.map(({ id }) => ({ id }))
                                        })
                                    ),
                                    previewImageFile: article.previewImageFile ? { id: article.previewImageFile.id } : null,
                                    category: article.category ? { id: article.category.id } : null,
                                    groups: article.groups.map(({ id }) => ({ id })),
                                    users: article.users.map(({ id }) => ({ id })),
                                }
                            },
                        });
                    }}
                />
            </BaseLayoutSidebar>
        </>
    );
});
