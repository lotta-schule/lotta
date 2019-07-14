import { ArticleModel, ContentModuleType } from '../../model';
import React, { FunctionComponent, memo, useState } from 'react';
import { Article } from '../article/Article';
import { EditArticleSidebar } from './editArticle/EditArticleSidebar';
import { Button } from '@material-ui/core';
import { Value } from 'slate';
import useReactRouter from 'use-react-router';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
const { serialize } = require('slate-base64-serializer').default;

export interface ArticleLayoutProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): Promise<void>;
}

export const EditArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article, onUpdateArticle }) => {
    const [editedArticle, setEditedArticle] = useState(article);
    const { history } = useReactRouter();
    return (
        <>
            <BaseLayoutMainContent>
                <Article article={editedArticle} isEditModeEnabled onUpdateArticle={setEditedArticle} />
                <div>
                    <Button
                        variant="outlined"
                        color={'primary'}
                        onClick={async () => {
                            setEditedArticle({
                                ...editedArticle,
                                contentModules: [
                                    ...editedArticle.contentModules,
                                    {
                                        id: new Date().getTime().toString(),
                                        sortKey: Math.max(...editedArticle.contentModules.map(cm => cm.sortKey || 0)) + 10,
                                        type: ContentModuleType.TEXT,
                                        text: serialize(Value.fromJSON({ object: "value", document: { object: "document", data: {}, nodes: [{ object: "block", type: "paragraph", data: {}, nodes: [{ object: 'text', text: "Lorem ipsum...", marks: [] } as any] }] } }))
                                    }
                                ]
                            });
                        }}
                    >
                        + TEXT
                </Button>
                </div>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <EditArticleSidebar
                    article={editedArticle}
                    onUpdate={setEditedArticle}
                    onSave={async () => {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (onUpdateArticle) {
                            await onUpdateArticle(editedArticle);
                        }
                        history.push(editedArticle.pageName ? `/page/${editedArticle.pageName}` : `/article/${editedArticle.id}`);
                    }}
                />
            </BaseLayoutSidebar>
        </>
    );
});