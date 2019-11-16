import React, { memo, useMemo } from 'react';
import { Article } from '../article/Article';
import { ArticleModel } from '../../model';
import { CircularProgress, Typography, makeStyles, Theme } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { RelatedArticlesList } from 'component/article/RelatedArticlesList';
import { Helmet } from 'react-helmet';
import { useTenant } from 'util/client/useTenant';
import { useQuery } from 'react-apollo';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { ID } from 'model/ID';
import { WidgetsList } from './WidgetsList';

const useStyle = makeStyles((theme: Theme) => ({
    siteTitle: {
        paddingTop: '1.5em',
        paddingBottom: '1em',
        paddingLeft: '1em',
        fontSize: '1.5rem',
        letterSpacing: '0.3em',
        color: theme.palette.primary.dark,
        backgroundColor: theme.palette.background.paper,
        textTransform: 'uppercase',
    }
}));

export interface ArticleLayoutProps {
    title?: string;
    articleId: ID;
}

export const ArticleLayout = memo<ArticleLayoutProps>(({ articleId, title }) => {
    const styles = useStyle();
    const client = useTenant() || {};

    const { data, loading: isLoading, error } = useQuery<{ article: ArticleModel }, { id: ID }>(GetArticleQuery, { variables: { id: articleId } });

    const mainContent = useMemo(() => {
        if (isLoading) {
            return <div><CircularProgress /></div>;
        }
        if (error) {
            return (<div><span style={{ color: 'red' }}>{error.message}</span></div>);
        }

        if (data && data.article) {
            const { article } = data;
            return (
                <>
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
                </>
            );
        }
        return (
            <span style={{ color: 'red' }}>Beitrag nicht gefunden.</span>
        );

    }, [client.title, data, error, isLoading, styles.siteTitle, title]);

    return (
        <>
            <BaseLayoutMainContent>
                {mainContent}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <WidgetsList widgets={[]} />
            </BaseLayoutSidebar>
        </>
    );
});