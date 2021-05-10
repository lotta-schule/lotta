import * as React from 'react';
import { ArticleModel } from 'model';
import { useQuery } from '@apollo/client';
import { Typography, makeStyles, LinearProgress } from '@material-ui/core';
import { useTransition, animated } from 'react-spring';
import { GetArticlesForTag } from 'api/query/GetArticlesForTagQuery';
import { ArticlePreviewDensedLayout } from './ArticlePreviewDensedLayout';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        textTransform: 'uppercase',
        letterSpacing: 4,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2),
    },
}));

export interface RelatedArticlesListProps {
    tag: string;
}

export const RelatedArticlesList = React.memo<RelatedArticlesListProps>(
    ({ tag }) => {
        const styles = useStyles();
        const { data, loading: isLoading } = useQuery<
            { articles: ArticleModel[] },
            { tag: string }
        >(GetArticlesForTag, { variables: { tag } });
        const relatedArticles =
            data?.articles.filter(
                () => true // (a) => a.id !== article.id
            ) ?? [];
        const transitions = useTransition(relatedArticles, {
            initial: { opacity: 0, maxHeight: 0 },
            from: { opacity: 0, maxHeight: 0 },
            enter: [{ opacity: 1, maxHeight: 100 }],
            leave: { opacity: 0, height: 0 },
            key: (a: ArticleModel) => a.id,
            trail: 1000,
        });

        if (isLoading) {
            return <LinearProgress />;
        }

        if (!relatedArticles.length) {
            return null;
        }
        return (
            <section>
                <Typography variant={'h6'} className={styles.root}>
                    Weitere Beiträge zum Thema <strong>{tag}</strong>
                </Typography>
                {transitions((props, article) => {
                    return (
                        <animated.div style={props}>
                            <ArticlePreviewDensedLayout
                                key={article.id}
                                article={article}
                                limitedHeight
                            />
                        </animated.div>
                    );
                })}
            </section>
        );
    }
);
