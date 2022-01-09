import * as React from 'react';
import { ArticleModel } from 'model';
import { useQuery } from '@apollo/client';
import { useTransition, animated } from 'react-spring';
import { ArticlePreviewDensedLayout } from 'article/preview';
import { LinearProgress } from 'shared/general/progress/LinearProgress';

import styles from './RelatedArticlesList.module.scss';

import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

export interface RelatedArticlesListProps {
    tag: string;
}

export const RelatedArticlesList = React.memo<RelatedArticlesListProps>(
    ({ tag }) => {
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
            return (
                <LinearProgress
                    isIndeterminate
                    aria-label={'verwandte Beiträge werden geladen'}
                />
            );
        }

        if (!relatedArticles.length) {
            return null;
        }
        return (
            <section data-testid={'RelatedArticlesList'}>
                <h6 className={styles.root}>
                    Weitere Beiträge zum Thema <strong>{tag}</strong>
                </h6>
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
RelatedArticlesList.displayName = 'RelatedArticlesList';
