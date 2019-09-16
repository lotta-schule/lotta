import { CategoryModel, ArticleModel } from '../../model';
import React, { memo } from 'react';
import { ArticlePreview } from '../article/ArticlePreview';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { theme } from 'theme';
import { parseISO } from 'date-fns';
import { ArticleLayout } from './ArticleLayout';
import { WidgetsList } from './WidgetsList';

const useStyles = makeStyles(() => ({
    subheaderContainer: {
        height: '120px',
        border: '0.5em solid #fff',
        marginBottom: '0.5em',
        backgroundColor: '#fff',
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
        color: theme.palette.primary.main,
    }
}));

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout = memo<CategoryLayoutProps>(({ category, articles }) => {
    const styles = useStyles();

    if (articles && articles.length === 1 && articles[0].id) {
        return (
            <ArticleLayout articleId={articles[0].id} />
        );
    }

    return (
        <>
            <BaseLayoutMainContent>
                {!category.isHomepage && (
                    <Grid className={styles.subheaderContainer}>
                        <Grid
                            item
                            className={styles.subheader}
                            style={{
                                background: category.bannerImageFile ?
                                    `url(https://afdptjdxen.cloudimg.io/cover/900x150/foil1/${category.bannerImageFile.remoteLocation})` :
                                    'transparent'
                            }}
                        >
                            <Typography className={styles.bannerheading}>
                                {category.title}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
                {articles && articles.length > 1 && (
                    articles
                        .sort((a1, a2) => {
                            if (category && a1.isPinnedToTop !== a2.isPinnedToTop) {
                                if (a1.isPinnedToTop) { return -1; }
                                if (a2.isPinnedToTop) { return 1; }
                            }
                            return parseISO(a2.updatedAt).getTime() - parseISO(a1.updatedAt).getTime();
                        })
                        .map(article => (
                            <ArticlePreview key={article.id} article={article} limitedHeight />
                        ))
                )}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                {category && category.widgets && (
                    <WidgetsList widgets={category.widgets} />
                )}
            </BaseLayoutSidebar>
        </>
    );
});