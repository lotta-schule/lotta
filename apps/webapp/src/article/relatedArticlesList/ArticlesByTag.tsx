import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { LinearProgress } from '@lotta-schule/hubert';
import { motion } from 'framer-motion';
import { ArticlePreview } from 'article/preview';
import { ArticleModel } from 'model';

import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

import styles from './ArticlesByTag.module.scss';

export interface ArticlesByTagProps {
  tag: string;
  hideTitle?: boolean;
}

export const ArticlesByTag = React.memo(
  ({ tag, hideTitle }: ArticlesByTagProps) => {
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
        transition: { delay: Math.min(i * 0.15, 1.5) },
      }),
      hidden: { opacity: 0, y: -100 },
    };

    return (
      <motion.section
        data-testid={'ArticlesByTag'}
        initial={'hidden'}
        animate={'visible'}
        variants={containerVariants}
      >
        {!hideTitle && (
          <h6 className={styles.header}>
            Weitere Beiträge zum Thema <strong>{tag}</strong>
          </h6>
        )}
        {relatedArticles.map((article, i) => (
          <motion.div key={article.id} variants={itemVariants} custom={i}>
            {ArticlePreview && (
              <ArticlePreview
                layout="densed"
                article={article}
                limitedHeight
                disableEdit
                isEmbedded
              />
            )}
          </motion.div>
        ))}
      </motion.section>
    );
  }
);
ArticlesByTag.displayName = 'ArticlesByTag';
