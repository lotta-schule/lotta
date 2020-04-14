import React, { memo } from 'react';
import { CategoryModel, ArticleModel } from '../../model';
import { ArticlePreview } from '../article/ArticlePreview';
import { Grid, Typography, makeStyles, Theme } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { ArticleLayout } from './ArticleLayout';
import { WidgetsList } from './WidgetsList';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model/User';

const useStyles = makeStyles<Theme, { twoColumns: boolean }>(theme => ({
    subheaderContainer: {
        height: '120px',
        border: '0.5em solid',
        borderColor: theme.palette.background.paper,
        marginBottom: '0.5em',
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: `1px 1px 2px ${fade(theme.palette.text.primary, .2)}`,
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    subheader: {
        maxHeight: 120,
        width: '100%',
        height: '100%',
        flexShrink: 0,
        flexGrow: 0
    },
    bannerheading: {
        textTransform: 'uppercase',
        letterSpacing: '5px',
        fontSize: '1.5em',
        textShadow: '1px 1px 15px #fff',
        padding: '0.6em',
        color: theme.palette.primary.dark,
    },
    gridItem: {
        display: 'flex',
        '&:nth-child(2n)': {
            paddingLeft: ({ twoColumns }) => twoColumns ? theme.spacing(.5) : 'initial'
        },
        '&:nth-child(2n+1)': {
            paddingRight: ({ twoColumns }) => twoColumns ? theme.spacing(.5) : 'initial'
        }
    }
}));

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout = memo<CategoryLayoutProps>(({ category, articles }) => {
    const styles = useStyles({ twoColumns: category.layoutName === '2-columns' });
    const [user] = useCurrentUser();

    if (articles && articles.length === 1 && articles[0].id) {
        return (
            <ArticleLayout articleId={articles[0].id} />
        );
    }

    const widgets = ((category && category.widgets) || [])
        .filter(category => {
            if (User.isAdmin(user)) {
                return !!user!.groups.find(g => category.groups.length < 1 || !!category.groups.find(cg => cg.id === g.id));
            }
            return true;
        });

    return (
        <>
            <BaseLayoutMainContent>
                {!category.isHomepage && (
                    <Grid className={styles.subheaderContainer}>
                        <Grid
                            item
                            xs={12}
                            className={styles.subheader}
                            style={{
                                background: category.bannerImageFile ?
                                    `url(https://afdptjdxen.cloudimg.io/cover/900x150/foil1/${category.bannerImageFile.remoteLocation})` :
                                    'transparent'
                            }}
                        >
                            <Typography variant={'h2'} className={styles.bannerheading}>
                                {category.title}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
                <Grid container wrap={'wrap'}>
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
                                <Grid item xs={category.layoutName === '2-columns' ? 6 : 12} className={styles.gridItem}>
                                    <ArticlePreview key={article.id} article={article} limitedHeight layout={category.layoutName ?? 'standard'} />
                                </Grid>
                            ))
                    )}
                </Grid>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <WidgetsList widgets={widgets} />
            </BaseLayoutSidebar>
        </>
    );
});