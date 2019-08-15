import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { useQuery } from 'react-apollo';
import { GetTopicQuery } from 'api/query/GetTopicQuery';
import { ArticlePreview } from './ArticlePreview';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        textTransform: 'uppercase',
        letterSpacing: 4,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2)
    }
}));

export interface RelatedArticlesListProps {
    article: ArticleModel;
}

export const RelatedArticlesList = memo<RelatedArticlesListProps>(({ article }) => {
    const styles = useStyles();
    const { data } = useQuery<{ articles: ArticleModel[] }, { topic: string }>(GetTopicQuery, { variables: { topic: article.topic! } });
    if (!data || !data.articles || !data.articles.length) {
        return null;
    }
    return (
        <>
            <Typography variant={'h6'} className={styles.root}>Weitere Beiträge zum Thema <strong>{article.topic!}</strong></Typography>
            {data.articles.filter(a => a.id !== article.id).map(relatedArticle => (
                <ArticlePreview key={relatedArticle.id} article={relatedArticle} />
            ))}
        </>
    );
});