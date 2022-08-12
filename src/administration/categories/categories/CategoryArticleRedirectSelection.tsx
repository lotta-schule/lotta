import * as React from 'react';
import { ComboBox, LinearProgress } from '@lotta-schule/hubert';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useServerData } from 'shared/ServerDataContext';
import { ArticlePreviewDensedLayout } from 'article/preview';
import { ArticleModel, ID } from 'model';
import { Article, File } from 'util/model';
import getConfig from 'next/config';

import SearchQuery from 'api/query/SearchQuery.graphql';
import GetArticleForPreviewQuery from 'api/query/GetArticleForPreviewQuery.graphql';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface CategoryArticleRedirectSelection {
    redirectPath: string;
    onSelectRedirectPath: (redirectPath: string) => void;
}

export const CategoryArticleRedirectSelection =
    React.memo<CategoryArticleRedirectSelection>(
        ({ redirectPath, onSelectRedirectPath }) => {
            const { baseUrl } = useServerData();

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
                            return [
                                articleData?.article,
                                ...(data?.results ?? []),
                            ]
                                .filter(
                                    (article): article is ArticleModel =>
                                        !!article
                                )
                                .map((article) => ({
                                    key: Article.getPath(article),
                                    label: article.title,
                                    selected: article.id === articleId,
                                    textValue: article.title,
                                    leftSection: article.previewImageFile && (
                                        <img
                                            src={`https://${cloudimageToken}.cloudimg.io/cover/80x60/foil1/${File.getFileRemoteLocation(
                                                baseUrl,
                                                article.previewImageFile
                                            )}`}
                                            alt={`Vorschaubild zum Beitrag "${article.title}"`}
                                        />
                                    ),
                                    description: (
                                        <span>
                                            {article.category?.title && (
                                                <span>
                                                    Kategorie:{' '}
                                                    {article.category.title}
                                                </span>
                                            )}
                                            {
                                                <span>
                                                    {Article.getPath(article)}
                                                </span>
                                            }
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
                                    Kategorie wird zu {redirectPath}
                                    weitergeleitet
                                </strong>
                            </div>
                        )}

                        {isLoadingArticle && (
                            <LinearProgress
                                isIndeterminate
                                aria-label={
                                    'Informationen zum Beitrag werden geladen'
                                }
                            />
                        )}
                        {articleData?.article && (
                            <ArticlePreviewDensedLayout
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
