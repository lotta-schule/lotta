import React, { FunctionComponent, memo, useState, useEffect } from 'react';
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
    onUpdateArticle?(article: ArticleModel): Promise<void>;
}

export const EditArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article, onUpdateArticle }) => {
    const { history } = useReactRouter();
    const currentUser = useCurrentUser();

    const [editedArticle, setEditedArticle] = useState(article);

    useEffect(() => {
        if (!currentUser) {
            history.push(`/article/${article.id}`);
        }
    }, [article.id, currentUser, history]);

    return (
        <>
            <BaseLayoutMainContent>
                <Article article={editedArticle} isEditModeEnabled onUpdateArticle={setEditedArticle} />
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
                    onSave={async () => {
                        if (onUpdateArticle) {
                            await onUpdateArticle({
                                ...omit(editedArticle, ['isPinnedToTop']) as ArticleModel,
                                contentModules: editedArticle.contentModules.map(cm => ({
                                    ...cm,
                                    configuration: JSON.stringify(cm.configuration || {})
                                }))
                            });
                        }
                        history.push(`/article/${editedArticle.id}`);
                    }}
                />
            </BaseLayoutSidebar>
        </>
    );
});
