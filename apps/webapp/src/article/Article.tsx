import { Suspense, memo } from 'react';
import { ArticleModel } from 'model';
import { ContentModule } from './module/ContentModule';
import { ArticleTitle } from './ArticleTitle';
import { ArticleReactions } from './articleReactions';
import { ReactionCountButtons } from './articleReactions/ReactionCountButtons';

import styles from './Article.module.scss';

interface ArticleProps {
  article: ArticleModel;
}

export const Article = memo(({ article }: ArticleProps) => {
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
      {article.isReactionsEnabled && (
        <Suspense
          fallback={
            <ReactionCountButtons reactions={article.reactionCounts ?? []} />
          }
        >
          <ArticleReactions article={article} />
        </Suspense>
      )}
    </article>
  );
});
Article.displayName = 'Article';
