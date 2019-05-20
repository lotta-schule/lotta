import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import BaseLayout from './BaseLayout';
import React, { FunctionComponent, memo } from 'react';
import { Typography } from '@material-ui/core';

export interface PageLayoutProps {
    title?: string;
    articles?: ArticleModel[];
}

export const PageLayout: FunctionComponent<PageLayoutProps> = memo(({ articles, title }) => {
    return (
        <BaseLayout>
            {title && <Typography variant={'h3'}>{title}</Typography>}
            {articles && articles.map(article => (
                <Article key={article.id} article={article} />
            ))}
        </BaseLayout>
    );
});