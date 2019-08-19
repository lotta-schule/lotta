import React, { memo } from 'react';
import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { RelatedArticlesList } from 'component/article/RelatedArticlesList';
import { Helmet } from 'react-helmet';
import { useTenant } from 'util/client/useTenant';

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
    const client = useTenant();

    return (
        <>
            <BaseLayoutMainContent>
                <Helmet>
                    <title>{article.title} &nbsp; {client.title}</title>
                    <meta name={'description'} content={article.preview} />
                    <meta property={'og:type'} content={'article'} />
                    <meta property={'og:description'} content={article.preview} />
                    <meta property={'twitter:card'} content={article.preview} />
                    {article.previewImageFile && (
                        <meta property={'og:image'} content={`https://afdptjdxen.cloudimg.io/cover/1800x945/foil1/${article.previewImageFile.remoteLocation}`} />
                    )}
                    <meta property={'og:site_name'} content={client.title} />
                </Helmet>
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