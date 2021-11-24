import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Grid, NoSsr } from '@material-ui/core';
import { CategoryModel, ArticleModel, WidgetModel } from 'model';
import { Header, Main, Sidebar } from 'layout';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { File, User } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import { WidgetsList } from './widgetsList/WidgetsList';
import { ArticlePreview } from 'article/preview';
import clsx from 'clsx';
import getConfig from 'next/config';

import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';

import styles from './CategoryPage.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface CategoryPageProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryPage = React.memo<CategoryPageProps>(
    ({ category, articles }) => {
        const { baseUrl } = useServerData();
        const twoColumnsLayout = category.layoutName === '2-columns';
        const user = useCurrentUser();

        const {
            data: widgetsData,
            error: widgetsError,
            loading: isWidgetsLoading,
        } = useQuery(GetCategoryWidgetsQuery, {
            variables: { categoryId: category.id },
        });
        const widgets = (widgetsData?.widgets ?? []).filter(
            (widget: WidgetModel) => {
                if (User.isAdmin(user)) {
                    return !!user!.groups.find(
                        (g) =>
                            widget.groups.length < 1 ||
                            !!widget.groups.find((cg) => cg.id === g.id)
                    );
                }
                return true;
            }
        );

        const bannerImageUrl =
            (category.bannerImageFile &&
                `https://${cloudimageToken}.cloudimg.io/crop/950x120/foil1/${File.getFileRemoteLocation(
                    baseUrl,
                    category.bannerImageFile
                )}`) ||
            undefined;

        return (
            <>
                <Main>
                    <Header bannerImageUrl={bannerImageUrl}>
                        <h2 data-testid="title">{category.title}</h2>
                    </Header>
                    <Grid container wrap={'wrap'} className={styles.articles}>
                        {articles &&
                            articles.length > 1 &&
                            [...articles]
                                .sort((a1, a2) => {
                                    if (
                                        !category.isHomepage &&
                                        a1.isPinnedToTop !== a2.isPinnedToTop
                                    ) {
                                        if (a1.isPinnedToTop) {
                                            return -1;
                                        }
                                        if (a2.isPinnedToTop) {
                                            return 1;
                                        }
                                    }
                                    return (
                                        new Date(a2.updatedAt).getTime() -
                                        new Date(a1.updatedAt).getTime()
                                    );
                                })
                                .map((article) => (
                                    <Grid
                                        item
                                        xs={twoColumnsLayout ? 6 : 12}
                                        className={clsx(styles.gridItem, {
                                            [styles['two-columns']]:
                                                twoColumnsLayout,
                                        })}
                                        key={article.id}
                                    >
                                        <ArticlePreview
                                            article={article}
                                            limitedHeight
                                            layout={
                                                category.layoutName ??
                                                'standard'
                                            }
                                        />
                                    </Grid>
                                ))}
                    </Grid>
                </Main>
                <Sidebar
                    isEmpty={
                        !widgetsError && !isWidgetsLoading && widgets.length < 1
                    }
                >
                    {widgetsError && <ErrorMessage error={widgetsError} />}
                    <NoSsr>
                        <WidgetsList widgets={widgets} />
                    </NoSsr>
                </Sidebar>
            </>
        );
    }
);
