import { ArticleModel, ContentModuleType } from '../../model';
import { ConnectedBaseLayout } from './ConnectedBaseLayout';
import React, { FunctionComponent, memo, useState } from 'react';
import { Article } from '../article/Article';
import { EditArticleSidebar } from './editArticle/EditArticleSidebar';
import { Button } from '@material-ui/core';
import { Value } from 'slate';
const { serialize } = require('slate-base64-serializer').default;

// const style: StyleRulesCallback = () => ({
//     card: {
//         display: 'flex',
//         flexDirection: 'row'
//     }
// });

export interface ArticleLayoutProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): void;
}

export const EditArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article, onUpdateArticle }) => {
    const [editedArticle, setEditedArticle] = useState(article);
    return (
        <ConnectedBaseLayout
            sidebar={(
                <EditArticleSidebar
                    article={editedArticle}
                    onUpdate={setEditedArticle}
                    onSave={() => {
                        if (onUpdateArticle) {
                            onUpdateArticle(editedArticle);
                        }
                    }}
                />
            )}
        >
            <Article article={editedArticle} isEditModeEnabled onUpdateArticle={setEditedArticle} />
            <div>
                <Button
                    variant="outlined"
                    color={'primary'}
                    onClick={async () => {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        setEditedArticle({
                            ...editedArticle,
                            modules: [
                                ...editedArticle.modules,
                                {
                                    id: new Date().getTime().toString(),
                                    type: ContentModuleType.Text,
                                    text: serialize(Value.fromJSON({ object: "value", document: { object: "document", data: {}, nodes: [{ object: "block", type: "paragraph", data: {}, nodes: [{ object: 'text', text: "Lorem ipsum...", marks: [] } as any] }] } }))
                                }
                            ]
                        });
                    }}
                >
                    + TEXT
                </Button>
            </div>
        </ConnectedBaseLayout>
    );
});