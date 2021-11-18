import * as React from 'react';
import { Article } from 'article/Article';
import { ArticleModel } from 'model';
import { File } from 'util/model';
import { RelatedArticlesList } from 'article/relatedArticlesList/RelatedArticlesList';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'shared/ServerDataContext';
import Head from 'next/head';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

import styles from './ArticlePage.module.scss';

export interface ArticlePageProps {
    title?: string;
    article: ArticleModel;
}

export const ArticlePage = React.memo<ArticlePageProps>(
    ({ article, title }) => {
        const { baseUrl } = useServerData();
        const tenant = useTenant();

        return (
            <div className={styles.root}>
                <Head>
                    <title>
                        {article.title} &nbsp; {tenant.title}
                    </title>
                    <meta name={'description'} content={article.preview} />
                    <meta property={'og:type'} content={'article'} />
                    <meta
                        property={'og:description'}
                        content={article.preview}
                    />
                    <meta property={'twitter:card'} content={article.preview} />
                    {article.previewImageFile && (
                        <meta
                            property={'og:image'}
                            content={`https://${cloudimageToken}.cloudimg.io/cover/1800x945/foil1/${File.getFileRemoteLocation(
                                baseUrl,
                                article.previewImageFile
                            )}`}
                        />
                    )}
                    <meta property={'og:site_name'} content={tenant.title} />
                </Head>
                {title && <h3 className={styles.title}>{title}</h3>}
                <Article article={article} />
                {article.tags?.map((tag) => (
                    <RelatedArticlesList key={tag} tag={tag} />
                ))}
            </div>
        );
    }
);
ArticlePage.displayName = 'ArticleLayout';
