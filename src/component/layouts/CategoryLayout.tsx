import { CategoryModel, ArticleModel } from '../../model';
import BaseLayout from './BaseLayout';
import React, { FunctionComponent, memo } from 'react';
import { ArticlePreview } from '../article/ArticlePreview';

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout: FunctionComponent<CategoryLayoutProps> = memo(({ articles }) => {
    return (
        <BaseLayout>
            {articles && articles.map(article => (
                <ArticlePreview article={article} />
            ))}
        </BaseLayout>
    );
});