import * as React from 'react';
import { ArticleModel, ID } from '../../../model';
import { ArticleEditable as Article } from '../../article/ArticleEditable';
import { EditArticleSidebar } from './EditArticleSidebar';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { AddModuleBar } from 'component/article/AddModuleBar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article as ArticleUtil } from 'util/model/Article';
import { useMutation } from '@apollo/client';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import omit from 'lodash/omit';
import useRouter from 'use-react-router';

export interface ArticleLayoutProps {
    article: ArticleModel;
}

export const EditArticleLayout = React.memo<ArticleLayoutProps>(({ article }) => {
    const { history } = useRouter();
    const [currentUser] = useCurrentUser();

    const [editedArticle, setEditedArticle] = React.useState(article);
    const [saveArticle, { loading: isLoading }] = useMutation<{ article: ArticleModel }, { id: ID, article: any }>(UpdateArticleMutation, {
        onCompleted: ({ article }) => {
            if (article) {
                history.push(ArticleUtil.getPath(article));
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
                                            ...(/^-/.test(cm.id) ? omit(cm, ['id']) : cm),
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
