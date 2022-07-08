import * as React from 'react';
import { useQuery } from '@apollo/client';
import { LinearProgress } from '@lotta-schule/hubert';
import { motion } from 'framer-motion';
import { ArticlePreviewDensedLayout } from 'article/preview';
import { ArticleModel } from 'model';

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

        const containerVariants = {
            hidden: {
                opacity: 0,
                scaleX: 0,
            },
            visible: {
                opacity: 1,
                scaleX: 1,
            },
        };

        const itemVariants = {
            visible: (i: number) => ({
                opacity: 1,
                y: 0,
                transition: { delay: i * 0.3 },
            }),
            hidden: { opacity: 0, y: -100 },
        };

        return (
            <motion.section
                data-testid={'RelatedArticlesList'}
                initial={'hidden'}
                animate={'visible'}
                variants={containerVariants}
            >
                <h6 className={styles.root}>
                    Weitere Beiträge zum Thema <strong>{tag}</strong>
                </h6>
                {relatedArticles.map((article, i) => (
                    <motion.div
                        key={article.id}
                        variants={itemVariants}
                        custom={i}
                    >
                        <ArticlePreviewDensedLayout
                            article={article}
                            limitedHeight
                        />
                    </motion.div>
                ))}
            </motion.section>
        );
    }
);
RelatedArticlesList.displayName = 'RelatedArticlesList';
