import React, { memo } from 'react';
import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { RelatedArticlesList } from 'component/article/RelatedArticlesList';

const useStyle = makeStyles((theme: Theme) => ({
    siteTitle: {
        paddingTop: '1.5em',
        paddingBottom: '1em',
        paddingLeft: '1em',
        fontSize: '1.5rem',
        letterSpacing: '0.3em',
        color: theme.palette.primary.main,
        backgroundColor: '#fff',
        textTransform: 'uppercase',
    }
}));

export interface ArticleLayoutProps {
    title?: string;
    article: ArticleModel;
}

export const ArticleLayout = memo<ArticleLayoutProps>(({ article, title }) => {
    const styles = useStyle();

    return (
        <>
            <BaseLayoutMainContent>
                {title && <Typography variant={'h3'} className={styles.siteTitle}>{title}</Typography>}
                <Article article={article} />
                {article.topic && (
                    <RelatedArticlesList article={article} />
                )}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar />
        </>
    );
});