import { ArticleModel } from '../../model';
import BaseLayout from './BaseLayout';
import React, { FunctionComponent, memo, useState } from 'react';
import { Article } from '../article/Article';
import { EditArticleSidebar } from './editArticle/EditArticleSidebar';

// const style: StyleRulesCallback = () => ({
//     card: {
//         display: 'flex',
//         flexDirection: 'row'
//     }
// });

export interface ArticleLayoutProps {
    article: ArticleModel;
}

export const EditArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article }) => {
    const [editedArticle, setEditedArticle] = useState(article);
    return (
        <BaseLayout sidebar={<EditArticleSidebar article={editedArticle} onUpdate={setEditedArticle} onSave={() => { }} />}>
            <Article article={editedArticle} isEditModeEnabled />
        </BaseLayout>
    );
});