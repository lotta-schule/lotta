import React, { memo } from 'react';
import { CategoryModel, ArticleModel, WidgetModel } from '../../model';
import { ArticlePreview } from '../article/ArticlePreview';
import { Grid, Typography, makeStyles, Theme } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { ArticleLayout } from './ArticleLayout';
import { WidgetsList } from './WidgetsList';
import { useQuery } from '@apollo/client';
import { GetCategoryWidgetsQuery } from 'api/query/GetCategoryWidgetsQuery';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { Header } from 'component/general/Header';

const useStyles = makeStyles<Theme, { twoColumns: boolean }>(theme => ({
    gridItem: {
        display: 'flex',
        '&:nth-child(2n)': {
            paddingLeft: ({ twoColumns }) => twoColumns ? theme.spacing(.5) : 'initial'
        },
        '&:nth-child(2n+1)': {
            paddingRight: ({ twoColumns }) => twoColumns ? theme.spacing(.5) : 'initial'
        },
        '& > *': {
            width: '100%'
        }
    },
    articles: {
        marginTop: theme.spacing(1)
    },
    userNavigationGridItem: {
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        },
        maxWidth: '35%',
    }
}));

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout = memo<CategoryLayoutProps>(({ category, articles }) => {
    const styles = useStyles({ twoColumns: category.layoutName === '2-columns' });
    const [user] = useCurrentUser();

    const { data: widgetsData, error: widgetsError, loading: isWidgetsLoading } = useQuery(GetCategoryWidgetsQuery, {
        variables: { categoryId: category.id }
    });
    const widgets = (widgetsData?.widgets ?? []).filter((widget: WidgetModel) => {
        if (User.isAdmin(user)) {
            return !!user!.groups.find(g => widget.groups.length < 1 || !!widget.groups.find(cg => cg.id === g.id));
        }
        return true;
    });

    if (articles && articles.length === 1 && articles[0].id) {
        return (
            <ArticleLayout articleId={articles[0].id} />
        );
    }

    const bannerImageUrl = category.bannerImageFile?.remoteLocation && (
        `https://afdptjdxen.cloudimg.io/crop/950x120/foil1/${category.bannerImageFile.remoteLocation}`
    );
    return (
        <>
            <BaseLayoutMainContent>
                <Header bannerImageUrl={bannerImageUrl}>
                    <Typography variant={'h2'} data-testid="title">
                        {category.title}
                    </Typography>
                </Header>
                <Grid container wrap={'wrap'} className={styles.articles}>
                    {articles && articles.length > 1 && (
                        [...articles]
                            .sort((a1, a2) => {
                                if (!category.isHomepage && a1.isPinnedToTop !== a2.isPinnedToTop) {
                                    if (a1.isPinnedToTop) { return -1; }
                                    if (a2.isPinnedToTop) { return 1; }
                                }
                                return new Date(a2.updatedAt).getTime() - new Date(a1.updatedAt).getTime();
                            })
                            .map(article => (
                                <Grid item xs={category.layoutName === '2-columns' ? 6 : 12} className={styles.gridItem} key={article.id}>
                                    <ArticlePreview article={article} limitedHeight layout={category.layoutName ?? 'standard'} />
                                </Grid>
                            ))
                    )}
                </Grid>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty={!widgetsError && !isWidgetsLoading && widgets.length < 1}>
                {widgetsError && (
                    <ErrorMessage error={widgetsError} />
                )}
                <WidgetsList widgets={widgets} />
            </BaseLayoutSidebar>
        </>
    );
});
