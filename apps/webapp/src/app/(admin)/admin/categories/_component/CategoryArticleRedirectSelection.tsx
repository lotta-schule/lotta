import * as React from 'react';
import { ComboBox, LinearProgress } from '@lotta-schule/hubert';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import { ArticlePreview } from 'article/preview';
import { ArticleModel, ID } from 'model';
import { Article } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';

import SearchQuery from 'api/query/SearchQuery.graphql';
import GetArticleForPreviewQuery from 'api/query/GetArticleForPreviewQuery.graphql';

export interface CategoryArticleRedirectSelection {
  redirectPath: string;
  onSelectRedirectPath: (redirectPath: string) => void;
}

export const CategoryArticleRedirectSelection = React.memo(
  ({
    redirectPath,
    onSelectRedirectPath,
  }: CategoryArticleRedirectSelection) => {
    const [execute] = useLazyQuery<
      { results: ArticleModel[] },
      { searchText: string }
    >(SearchQuery);

    const articleId = redirectPath?.match(/\/a\/(\d+).*/)?.[1] ?? null;

    const { data: articleData, loading: isLoadingArticle } = useQuery<
      { article: ArticleModel },
      { id: ID }
    >(GetArticleForPreviewQuery, {
      variables: { id: articleId as string },
      skip: !articleId,
    });

    return (
      <section
        data-testid={'CategoryArticleRedirectSelection'}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <ComboBox
          fullWidth
          title={'Neuen Beitrag als Weiterleitungsziel auswählen'}
          placeholder={'Tippen um gewünschten Beitrag zu suchen.'}
          items={async (searchText) => {
            const { data } = await execute({
              variables: { searchText },
            });
            return [articleData?.article, ...(data?.results ?? [])]
              .filter((article): article is ArticleModel => !!article)
              .map((article) => ({
                key: Article.getPath(article),
                label: article.title,
                selected: article.id === articleId,
                textValue: article.title,
                leftSection: article.previewImageFile && (
                  <ResponsiveImage
                    file={article.previewImageFile}
                    format={'articlepreview'}
                    alt={`Vorschaubild zum Beitrag "${article.title}"`}
                    width={80}
                    style={{ width: '80px' }}
                  />
                ),
                description: (
                  <span>
                    {article.category?.title && (
                      <span>Kategorie: {article.category.title}</span>
                    )}
                    {<span>{Article.getPath(article)}</span>}
                  </span>
                ),
              }));
          }}
          onSelect={(path) => {
            onSelectRedirectPath(path.toString());
          }}
        />

        <div style={{ marginTop: 'var(--lotta-spacing)' }}>
          {redirectPath && redirectPath !== '/a/' && (
            <div>
              <strong>
                Kategorie wird zu <em> {redirectPath} </em> weitergeleitet
              </strong>
            </div>
          )}

          {isLoadingArticle && (
            <LinearProgress
              isIndeterminate
              aria-label={'Informationen zum Beitrag werden geladen'}
            />
          )}
          {articleData?.article && (
            <ArticlePreview
              article={articleData?.article}
              disablePin
              isEmbedded
              disableEdit
              disableLink
              limitedHeight
            />
          )}
        </div>
      </section>
    );
  }
);
CategoryArticleRedirectSelection.displayName =
  'CategoryArticleRedirectSelection';
