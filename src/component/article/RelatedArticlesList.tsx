import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { useQuery } from 'react-apollo';
import { GetTopicQuery } from 'api/query/GetTopicQuery';
import { ArticlePreview } from './ArticlePreview';
import { Typography } from '@material-ui/core';

export interface RelatedArticlesListProps {
    article: ArticleModel;
}

export const RelatedArticlesList = memo<RelatedArticlesListProps>(({ article }) => {
    const { data } = useQuery<{ articles: ArticleModel[] }, { topic: string }>(GetTopicQuery, { variables: { topic: article.topic! } });
    if (!data || !data.articles || !data.articles.length) {
        return null;
    }
    return (
        <>
            <Typography variant={'h3'}>Weitere Artikel zum Thema <strong>{article.topic!}</strong></Typography>
            {data.articles.filter(a => a.id !== article.id).map(a => (
                <ArticlePreview
                    key={a.id}
                    article={a}
                />
            ))}
        </>
    );
});