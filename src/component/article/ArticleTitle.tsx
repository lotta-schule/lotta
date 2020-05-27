import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { Grid, Typography, makeStyles, Theme } from '@material-ui/core';
import Img from 'react-cloudimage-responsive';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { UserNavigation } from 'component/layouts/navigation/UserNavigation';

export interface ArticleTitleProps {
    article: ArticleModel;
}

const useStyles = makeStyles<Theme>(theme => ({
    root: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.background.paper
    },
    mainSection: {
        paddingLeft: theme.spacing(2)
    },
    title: {
        fontSize: '1.6rem'
    },
    userNavigationGridItem: {
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        }
    }
}))
export const ArticleTitle = memo<ArticleTitleProps>(({ article }) => {
    const styles = useStyles();
    return (
        <Grid container className={styles.root}>
            {article.previewImageFile && (
                <Grid item xs={4} md={2}>
                    <Img
                        operation={'cover'}
                        size={'450x300'}
                        src={article.previewImageFile.remoteLocation}
                        alt={`Vorschaubild zu ${article.title}`}
                    />
                </Grid>
            )}
            <Grid item xs className={styles.mainSection}>
                <Typography component={'h2'} variant={'h2'} gutterBottom className={styles.title}>
                    {article.title}
                </Typography>
                <Typography component={'div'} variant={'subtitle1'}>
                    <>&nbsp;<AuthorAvatarsList users={article.users} />&nbsp;</>
                    {format(new Date(article.updatedAt), 'P', { locale: de }) + ' '}
                    {article.topic && <>| {article.topic}&nbsp;</>}
                </Typography>
            </Grid>
            <Grid item md={4} xl={3} className={styles.userNavigationGridItem}>
                <UserNavigation />
            </Grid>
        </Grid>
    )
});