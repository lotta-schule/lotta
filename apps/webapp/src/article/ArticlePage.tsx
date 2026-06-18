'use client';

import * as React from 'react';
import { Article } from '#/article/Article';
import { ArticleModel } from '#/model';
import { ArticlesByTag } from '#/article/relatedArticlesList';

import styles from './ArticlePage.module.scss';

export interface ArticlePageProps {
  title?: string;
  article: ArticleModel;
}

export const ArticlePage = React.memo(
  ({ article, title }: ArticlePageProps) => {
    return (
      <div className={styles.root}>
        {title && <h3 className={styles.title}>{title}</h3>}
        <Article article={article} />
        {article.tags?.map((tag) => (
          <ArticlesByTag key={tag} tag={tag} />
        ))}
      </div>
    );
  }
);
ArticlePage.displayName = 'ArticleLayout';
