import * as React from 'react';
import { Article } from 'article/Article';
import { ArticleModel } from 'model';
import { RelatedArticlesList } from 'article/relatedArticlesList/RelatedArticlesList';
import { ArticleHead } from './ArticleHead';

import styles from './ArticlePage.module.scss';

export interface ArticlePageProps {
  title?: string;
  article: ArticleModel;
}

export const ArticlePage = React.memo<ArticlePageProps>(
  ({ article, title }) => {
    return (
      <div className={styles.root}>
        <ArticleHead article={article} />
        {title && <h3 className={styles.title}>{title}</h3>}
        <Article article={article} />
        {article.tags?.map((tag) => (
          <RelatedArticlesList key={tag} tag={tag} />
        ))}
      </div>
    );
  }
);
ArticlePage.displayName = 'ArticleLayout';
