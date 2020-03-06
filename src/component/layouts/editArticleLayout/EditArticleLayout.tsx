import React, { memo, useState, useEffect } from 'react';
import { ArticleModel, ID, ArticleModelInput } from '../../../model';
import { Article } from '../../article/Article';
import { EditArticleSidebar } from './EditArticleSidebar';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { AddModuleBar } from 'component/article/AddModuleBar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { omit } from 'lodash';
import { useMutation } from '@apollo/react-hooks';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import useReactRouter from 'use-react-router';

export interface ArticleLayoutProps {
    article: ArticleModel;
}

export const EditArticleLayout = memo<ArticleLayoutProps>(({ article }) => {
    const { history } = useReactRouter();
    const [currentUser] = useCurrentUser();

    const [editedArticle, setEditedArticle] = useState(article);
    const [saveArticle, { loading: isLoading }] = useMutation<{ article: ArticleModel }, { id: ID, article: ArticleModelInput }>(UpdateArticleMutation, {
        onCompleted: ({ article }) => {
            if (article) {
                history.push(`/article/${article.id}`);
            }
        }
    });

    useEffect(() => {
        if (!currentUser) {
            history.push(`/article/${article.id}`);
        }
    }, [article.id, currentUser, history]);

    return (
        <>
            <BaseLayoutMainContent>
                <Article article={editedArticle} isEditModeEnabled onUpdateArticle={article => { setEditedArticle(article); }} />
                <AddModuleBar onAddModule={async contentModule => {
                    setEditedArticle({
                        ...editedArticle,
                        contentModules: [
                            ...editedArticle.contentModules,
                            {
                                configuration: {},
                                ...contentModule,
                                sortKey: editedArticle.contentModules.length ?
                                    Math.max(...editedArticle.contentModules.map(cm => cm.sortKey || 0)) + 10 :
                                    0,
                            }
                        ]
                    });
                }} />
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
                                configuration: JSON.stringify(cm.configuration || {})
                            }))
                        };
                        saveArticle({
                            variables: {
                                id: article.id,
                                article: {
                                    ...omit(article, ['id']),
                                    contentModules: article.contentModules.map(cm =>
                                        cm.id < 0 ? omit(cm, ['id']) : cm
                                    )
                                } as ArticleModelInput
                            },
                        });
                    }}
                />
            </BaseLayoutSidebar>
        </>
    );
});
