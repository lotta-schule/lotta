import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Article } from '../article/Article';
import { ArticleModel, ID } from 'model';
import { File } from 'util/model';
import {
    CircularProgress,
    Typography,
    makeStyles,
    Theme,
} from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { RelatedArticlesList } from 'component/article/RelatedArticlesList';
import { Helmet } from 'react-helmet';
import { useTenant } from 'util/tenant/useTenant';
import { GetArticleQuery } from 'api/query/GetArticleQuery';
import { ErrorMessage } from 'component/general/ErrorMessage';

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
    },
}));

export interface ArticleLayoutProps {
    title?: string;
    articleId: ID;
}

export const ArticleLayout = React.memo<ArticleLayoutProps>(
    ({ articleId, title }) => {
        const styles = useStyle();
        const tenant = useTenant() || {};

        const { data, loading: isLoading, error } = useQuery<
            { article: ArticleModel },
            { id: ID }
        >(GetArticleQuery, { variables: { id: articleId } });

        const mainContent = React.useMemo(() => {
            if (isLoading) {
                return (
                    <div>
                        <CircularProgress />
                    </div>
                );
            }
            if (error) {
                return <ErrorMessage error={error} />;
            }

            if (data && data.article) {
                const { article } = data;
                return (
                    <>
                        <Helmet>
                            <title>
                                {article.title} &nbsp; {tenant.title}
                            </title>
                            <meta
                                name={'description'}
                                content={article.preview}
                            />
                            <meta property={'og:type'} content={'article'} />
                            <meta
                                property={'og:description'}
                                content={article.preview}
                            />
                            <meta
                                property={'twitter:card'}
                                content={article.preview}
                            />
                            {article.previewImageFile && (
                                <meta
                                    property={'og:image'}
                                    content={`https://afdptjdxen.cloudimg.io/cover/1800x945/foil1/${File.getFileRemoteLocation(
                                        article.previewImageFile
                                    )}`}
                                />
                            )}
                            <meta
                                property={'og:site_name'}
                                content={tenant.title}
                            />
                        </Helmet>
                        {title && (
                            <Typography
                                variant={'h3'}
                                className={styles.siteTitle}
                            >
                                {title}
                            </Typography>
                        )}
                        <Article article={article} />
                        {article.tags?.map((tag) => (
                            <RelatedArticlesList key={tag} tag={tag} />
                        ))}
                    </>
                );
            }
            return <ErrorMessage error={new Error('Beitrag nicht gefunden')} />;
        }, [tenant.title, data, error, isLoading, styles.siteTitle, title]);

        return (
            <>
                <BaseLayoutMainContent>{mainContent}</BaseLayoutMainContent>
                <BaseLayoutSidebar isEmpty />
            </>
        );
    }
);
