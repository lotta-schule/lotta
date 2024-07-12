import * as React from 'react';
import { ArticleModel } from 'model';
import { ContentModule } from './module/ContentModule';
import { ArticleTitle } from './ArticleTitle';
import { ArticleReactions } from './articleReactions';

import styles from './Article.module.scss';

interface ArticleProps {
  article: ArticleModel;
}

export const Article = React.memo(({ article }: ArticleProps) => {
  return (
    <article className={styles.root} data-testid={'Article'}>
      <ArticleTitle article={article} />
      <section className={styles.contentModules}>
        {[...article.contentModules]
          .sort((cm1, cm2) => cm1.sortKey - cm2.sortKey)
          .map((contentModule, index) => (
            <ContentModule
              key={contentModule.id}
              index={index}
              article={article}
              contentModule={contentModule}
            />
          ))}
      </section>
      {article.isReactionsEnabled && <ArticleReactions article={article} />}
    </article>
  );
});
Article.displayName = 'Article';
