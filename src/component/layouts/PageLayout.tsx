import React, { FunctionComponent, memo } from 'react';
import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import { Typography } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';

export interface PageLayoutProps {
    title?: string;
    articles?: ArticleModel[];
}

export const PageLayout: FunctionComponent<PageLayoutProps> = memo(({ articles, title }) => {
    return (
        <>
            <BaseLayoutMainContent>
                {title && <Typography variant={'h3'} style={{ paddingTop: '1em', paddingBottom: '1em', paddingLeft: '0.4em', fontSize: '2.5rem', letterSpacing: '0.2em', color: '#9f9f9f', backgroundColor: '#fff' }}>{title}</Typography>}
                {articles && articles.map(article => (
                    <Article key={article.id} article={article} />
                ))}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar />
        </>
    );
});