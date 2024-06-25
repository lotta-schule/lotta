import * as React from 'react';
import { ArticleModel, ContentModuleModel } from 'model';
import { ArticleTitle } from './ArticleTitle';
import { ContentModule } from './module/ContentModule';

import styles from './ArticleEditable.module.scss';

interface ArticleEditableProps {
  article: ArticleModel;
  onUpdateArticle: (article: ArticleModel) => void;
}

export const ArticleEditable = React.memo<ArticleEditableProps>(
  ({ article, onUpdateArticle }) => {
    const moveContentModulePosition = (
      moduleId: ContentModuleModel['id'],
      sourceIndex: number,
      destinationIndex: number
    ) => {
      onUpdateArticle({
        ...article,
        contentModules: Array.from(article.contentModules)
          .map((contentModule) => {
            if (contentModule.id.toString() === moduleId) {
              return {
                ...contentModule,
                sortKey:
                  destinationIndex * 10 +
                  (destinationIndex > sourceIndex ? 1 : -1),
              };
            } else {
              return contentModule;
            }
          })
          .sort((cm1, cm2) => cm1.sortKey - cm2.sortKey)
          .map((cm, i) => ({
            ...cm,
            sortKey: i * 10,
          })),
      });
    };
    return (
      <article className={styles.root} data-testid={'ArticleEditable'}>
        <ArticleTitle article={article} onUpdate={onUpdateArticle} />
        <section className={styles.contentModules}>
          {[...article.contentModules]
            .sort((cm1, cm2) => cm1.sortKey - cm2.sortKey)
            .map((contentModule, index) => (
              <ContentModule
                key={contentModule.id}
                index={index}
                article={article}
                contentModule={contentModule}
                isEditModeEnabled
                onMoveUp={
                  index === 0
                    ? undefined
                    : () => {
                        moveContentModulePosition(
                          contentModule.id,
                          index,
                          index - 1
                        );
                      }
                }
                onMoveDown={
                  index + 1 === article.contentModules.length
                    ? undefined
                    : () => {
                        moveContentModulePosition(
                          contentModule.id,
                          index,
                          index + 1
                        );
                      }
                }
                onUpdateModule={(updatedModule) => {
                  console.log({ updatedModule });
                  onUpdateArticle({
                    ...article,
                    contentModules: article.contentModules.map(
                      (contentModule) =>
                        contentModule.id === updatedModule.id
                          ? updatedModule
                          : contentModule
                    ),
                  });
                }}
                onRemoveContentModule={() =>
                  onUpdateArticle({
                    ...article,
                    contentModules: article.contentModules.filter(
                      (currentModule) => contentModule.id !== currentModule.id
                    ),
                  })
                }
              />
            ))}
        </section>
      </article>
    );
  }
);
ArticleEditable.displayName = 'ArticleEditable';
