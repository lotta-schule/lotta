import { CategoryModel, ArticleModel } from '../../model';
import { ConnectedBaseLayout } from './ConnectedBaseLayout';
import React, { FunctionComponent, memo } from 'react';
import { ArticlePreview } from '../article/ArticlePreview';

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout: FunctionComponent<CategoryLayoutProps> = memo(({ articles }) => {
    return (
        <ConnectedBaseLayout>
            {articles && articles.map(article => (
                <ArticlePreview key={article.id} article={article} />
            ))}
        </ConnectedBaseLayout>
    );
});