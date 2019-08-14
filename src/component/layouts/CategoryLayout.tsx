import { CategoryModel, ArticleModel } from '../../model';
import React, { FunctionComponent, memo } from 'react';
import { ArticlePreview } from '../article/ArticlePreview';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { theme } from 'theme';
import { VPlan } from 'component/widgets/vPlan/VPlan';
import { Calendar } from 'component/widgets/calendar/Calendar';
import { parseISO } from 'date-fns';

const useStyles = makeStyles(() => ({
    subheaderContainer: {
        height: '120px',
        padding: '0.5em',
        marginBottom: '0.5em',
        // backgroundColor: '#fff',
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
        textShadow: '1px 1px 15px #000',
        padding: '0.6em',
        color: '#fff'
    }
}));

export interface CategoryLayoutProps {
    category: CategoryModel | null; // null for homepage
    articles?: ArticleModel[];
}

export const CategoryLayout: FunctionComponent<CategoryLayoutProps> = memo(({ category, articles }) => {
    const styles = useStyles();

    return (
        <>
            <BaseLayoutMainContent>
                {category && (
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
                {articles && articles.sort((a1, a2) => parseISO(a2.insertedAt).getTime() - parseISO(a1.insertedAt).getTime()).map(article => (
                    <ArticlePreview key={article.id} article={article} />
                ))}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <VPlan />
                <Calendar />
            </BaseLayoutSidebar>
        </>
    );
});