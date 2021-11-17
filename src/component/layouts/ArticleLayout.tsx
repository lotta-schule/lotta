import * as React from 'react';
import { Article } from '../article/Article';
import { ArticleModel } from 'model';
import { File } from 'util/model';
import { RelatedArticlesList } from 'component/article/RelatedArticlesList';
import { useTenant } from 'util/tenant/useTenant';
import { useServerData } from 'component/ServerDataContext';
import Head from 'next/head';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

import styles from './ArticleLayout.module.scss';

export interface ArticleLayoutProps {
    title?: string;
    article: ArticleModel;
}

export const ArticleLayout = React.memo<ArticleLayoutProps>(
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
ArticleLayout.displayName = 'ArticleLayout';
