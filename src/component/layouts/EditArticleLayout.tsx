import React, { memo, useState, useEffect } from 'react';
import { ArticleModel } from '../../model';
import { Article } from '../article/Article';
import { EditArticleSidebar } from './editArticle/EditArticleSidebar';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import useReactRouter from 'use-react-router';
import { AddModuleBar } from 'component/article/AddModuleBar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { omit } from 'lodash';

export interface ArticleLayoutProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): void;
}

export const EditArticleLayout = memo<ArticleLayoutProps>(({ article, onUpdateArticle }) => {
    const { history } = useReactRouter();
    const [currentUser] = useCurrentUser();

    const [editedArticle, setEditedArticle] = useState(article);

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
                                ...contentModule,
                                configuration: {},
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
                    onSave={async (additionalProps: Partial<ArticleModel> = {}) => {
                        if (onUpdateArticle) {
                            onUpdateArticle({
                                ...omit(editedArticle, ['isPinnedToTop']) as ArticleModel,
                                ...additionalProps,
                                contentModules: editedArticle.contentModules.map(cm => ({
                                    ...cm,
                                    configuration: JSON.stringify(cm.configuration || {})
                                }))
                            });
                        }
                    }}
                />
            </BaseLayoutSidebar>
        </>
    );
});
