import { CategoryModel, ArticleModel } from '../../model';
import React, { FunctionComponent, memo } from 'react';
import { ArticlePreview } from '../article/ArticlePreview';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { VPlan } from 'component/widgets/vplan/VPlan';
import { SCalendar } from 'component/widgets/calendar/SCalendar';

const useStyles = makeStyles(() => ({
    subheaderContainer: {
        height: '120px',
        padding: '0.5em',
        marginBottom: '0.5em',
        backgroundColor: '#fff',
    },
    subheader: {
        maxHeight: 120,
        width: '100%',
        height: '100%',
        flexShrink: 0,
        flexGrow: 0,
        backgroundImage: 'url(https://placeimg.com/900/120/any)'
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
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout: FunctionComponent<CategoryLayoutProps> = memo(({ category, articles }) => {
    const styles = useStyles();

    return (
        <>
            <BaseLayoutMainContent>
                {category && (
                    <Grid className={styles.subheaderContainer}>
                        <Grid item className={styles.subheader}>
                            <Typography className={styles.bannerheading}>
                                {category.title}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
                {articles && articles.map(article => (
                    <ArticlePreview key={article.id} article={article} />
                ))}
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <VPlan />
                <SCalendar />
            </BaseLayoutSidebar>
        </>
    );
});