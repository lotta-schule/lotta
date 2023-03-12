import * as React from 'react';
import { Article, File } from 'util/model';
import { ArticleModel } from 'model';
import { useTenant } from 'util/tenant/useTenant';
import { useImageUrl } from 'util/image/useImageUrl';
import { useServerData } from 'shared/ServerDataContext';
import { Tenant } from 'util/model/Tenant';
import Head from 'next/head';

export interface ArticleHeadProps {
    article: ArticleModel;
}

export const ArticleHead = React.memo<ArticleHeadProps>(({ article }) => {
    const { baseUrl } = useServerData();
    const tenant = useTenant();

    const { url: twitterImageUrl } = useImageUrl(
        article?.previewImageFile &&
            File.getFileRemoteLocation(baseUrl, article.previewImageFile),
        { width: 1200, height: 630, resize: 'cover' }
    );

    return (
        <Head>
            <title>
                {article.title} &nbsp; {tenant.title}
            </title>
            <meta name={'description'} content={article.preview} />
            <meta property={'og:site_name'} content={tenant.title} />
            <meta property={'og:type'} content={'article'} />
            <meta
                property={'og:url'}
                content={Tenant.getAbsoluteUrl(
                    tenant,
                    Article.getPath(article)
                )}
            />
            <meta property={'og:title'} content={article.title} />
            <meta property={'og:description'} content={article.preview} />
            <meta property={'og:url'} content={article.preview} />
            <meta
                property={'og:article:published_time'}
                content={article.insertedAt}
            />
            <meta
                property={'og:article:modified_time'}
                content={article.updatedAt}
            />
            <meta property={'twitter:card'} content={article.preview} />
            {article.previewImageFile && (
                <meta property={'og:image'} content={twitterImageUrl ?? ''} />
            )}
            <meta property={'og:image:width'} content={'1800'} />
            <meta property={'og:image:height'} content={'945'} />
        </Head>
    );
});
ArticleHead.displayName = 'ArticleHead';
