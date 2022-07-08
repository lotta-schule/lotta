import * as React from 'react';
import { ArticleModel } from 'model';
import { Article, File } from 'util/model';
import { useQuery } from '@apollo/client';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useDebounce } from 'util/useDebounce';
import { useServerData } from 'shared/ServerDataContext';
import { LinearProgress } from '@lotta-schule/hubert';
import { ArticlePreviewDensedLayout } from 'article/preview';
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
            const [searchText, setSearchText] = React.useState('');
            const debouncedSearchtext = useDebounce(searchText, 500);

            const { data, loading: isLoading } = useQuery(SearchQuery, {
                variables: {
                    searchText: debouncedSearchtext,
                },
                skip: !debouncedSearchtext,
            });

            const articleId = redirectPath?.match(/\/a\/(\d+).*/)?.[1] ?? null;

            const { data: articleData, loading: isLoadingArticle } = useQuery(
                GetArticleForPreviewQuery,
                {
                    variables: { id: Number(articleId) },
                    skip: !articleId,
                }
            );

            return (
                <section
                    data-testid={'CategoryArticleRedirectSelection'}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <Autocomplete
                        id={'CategoryArticleRedirectSelectionSearch'}
                        inputMode={'search'}
                        renderInput={(params) => {
                            return (
                                <TextField
                                    {...params}
                                    label={
                                        'Beitrag suchen und als Weiterleitung setzen'
                                    }
                                    variant={'standard'}
                                />
                            );
                        }}
                        filterOptions={(o) => o}
                        getOptionLabel={(a: ArticleModel) => a.title}
                        renderOption={(article: ArticleModel) => (
                            <>
                                {article.previewImageFile && (
                                    <img
                                        src={`https://${cloudimageToken}.cloudimg.io/cover/80x60/foil1/${File.getFileRemoteLocation(
                                            baseUrl,
                                            article.previewImageFile
                                        )}`}
                                        alt={`Vorschaubild zum Beitrag "${article.title}"`}
                                    />
                                )}
                                {article.title}
                            </>
                        )}
                        loading={isLoading}
                        inputValue={searchText}
                        onInputChange={(_e, value, reason) => {
                            if (reason === 'reset') {
                                setSearchText('');
                                return;
                            }
                            setSearchText(value);
                        }}
                        onChange={(_event, article: ArticleModel | null) => {
                            if (article) {
                                setSearchText('');
                                onSelectRedirectPath(Article.getPath(article));
                            }
                        }}
                        options={debouncedSearchtext ? data?.results ?? [] : []}
                    />

                    <div style={{ marginTop: 'var(--lotta-spacing)' }}>
                        {redirectPath && redirectPath !== '/a/' && (
                            <div>
                                <strong>
                                    Kategorie wird zu {redirectPath}{' '}
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
