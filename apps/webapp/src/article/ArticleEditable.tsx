import * as React from 'react';
import { ArticleModel, ContentModuleModel } from 'model';
import { ArticleTitle } from './ArticleTitle';
import { ContentModule } from './module/ContentModule';

import styles from './ArticleEditable.module.scss';

interface ArticleEditableProps {
  article: ArticleModel;
  onUpdateArticle: (article: React.SetStateAction<ArticleModel>) => void;
}

export const ArticleEditable = React.memo(
  ({ article, onUpdateArticle }: ArticleEditableProps) => {
    const moveContentModulePosition = React.useCallback(
      (
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
      },
      [article, onUpdateArticle]
    );

    const createOnMoveUp = React.useCallback(
      (contentModuleId: ContentModuleModel['id'], index: number) => () =>
        moveContentModulePosition(contentModuleId, index, index - 1),
      [moveContentModulePosition]
    );
    const createOnMoveDown = React.useCallback(
      (contentModuleId: ContentModuleModel['id'], index: number) => () =>
        moveContentModulePosition(contentModuleId, index, index + 1),
      [moveContentModulePosition]
    );
    const onUpdateModule = React.useCallback(
      (updatedModule: ContentModuleModel) => {
        onUpdateArticle((article) => ({
          ...article,
          contentModules: article.contentModules.map((contentModule) =>
            contentModule.id === updatedModule.id
              ? updatedModule
              : contentModule
          ),
        }));
      },
      [onUpdateArticle]
    );
    const createOnRemoveContentModule = React.useCallback(
      (contentModule: ContentModuleModel) => () =>
        onUpdateArticle({
          ...article,
          contentModules: article.contentModules.filter(
            (currentModule) => contentModule.id !== currentModule.id
          ),
        }),
      [article, onUpdateArticle]
    );

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
                    : createOnMoveUp(contentModule.id, index)
                }
                onMoveDown={
                  index + 1 === article.contentModules.length
                    ? undefined
                    : createOnMoveDown(contentModule.id, index)
                }
                onUpdateModule={onUpdateModule}
                onRemoveContentModule={createOnRemoveContentModule(
                  contentModule
                )}
              />
            ))}
        </section>
      </article>
    );
  }
);
ArticleEditable.displayName = 'ArticleEditable';
