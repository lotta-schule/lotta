import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { LinearProgress } from '@lotta-schule/hubert';
import { motion } from 'framer-motion';
import { ArticlePreview } from 'article/preview';
import { ArticleModel, UserModel } from 'model';

import GetArticlesByUserQuery from 'api/query/GetArticlesByUserQuery.graphql';

export interface ArticlesByUserProps {
  user: UserModel;
}

export const ArticlesByUser = React.memo(({ user }: ArticlesByUserProps) => {
  const { data, loading: isLoading } = useQuery<
    { articles: ArticleModel[] },
    { userId: UserModel['id'] }
  >(GetArticlesByUserQuery, { variables: { userId: user.id } });
  const articles =
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

  if (!articles.length) {
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
      data-testid={'ArticlesByUser'}
      initial={'hidden'}
      animate={'visible'}
      variants={containerVariants}
    >
      {articles.map((article, i) => (
        <motion.div key={article.id} variants={itemVariants} custom={i}>
          <ArticlePreview
            layout="densed"
            article={article}
            limitedHeight
            disableEdit
            isEmbedded
          />
        </motion.div>
      ))}
    </motion.section>
  );
});
ArticlesByUser.displayName = 'ArticlesByUser';
