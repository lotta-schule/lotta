import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import { ConnectedBaseLayout } from './ConnectedBaseLayout';
import { Typography } from '@material-ui/core';
import React, { FunctionComponent, memo } from 'react';

export interface PageLayoutProps {
    title?: string;
    articles?: ArticleModel[];
}

export const PageLayout: FunctionComponent<PageLayoutProps> = memo(({ articles, title }) => {
    return (
        <ConnectedBaseLayout>
            {title && <Typography variant={'h3'} style={{paddingTop: '1em', paddingBottom: '1em', paddingLeft: '0.4em', fontSize: '2.5rem', letterSpacing: '0.2em', color: '#9f9f9f' }}>{title}</Typography>}
            {articles && articles.map(article => (
                <Article key={article.id} article={article} />
            ))}
        </ConnectedBaseLayout>
    );
});