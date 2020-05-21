import React, { memo, useState } from 'react';
import { CircularProgress, Grid, TextField, Typography, makeStyles } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { ArticlePreviewDensedLayout } from 'component/article/ArticlePreviewDensedLayout';
import { ArticleModel } from 'model';
import { useDebounce } from 'util/useDebounce';
import { SearchQuery } from 'api/query/SearchQuery';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { UserNavigation } from './navigation/UserNavigation';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';

const useStyles = makeStyles(theme => ({
    subheader: {
        maxHeight: 120,
        width: '100%',
        height: '100%',
        flexShrink: 1,
        flexGrow: 1,
        position: 'relative',
        '&::after': {
            position: 'absolute',
            display: 'block',
            content: `''`,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, transparent 90%, #fff 99%, #fff)'
        }
    },
    bannerheading: {
        textTransform: 'uppercase',
        letterSpacing: '5px',
        fontSize: '1.5em',
        textShadow: '1px 1px 15px #fff',
        padding: '0.6em',
        color: theme.palette.primary.dark,
    },
    userNavigationGridItem: {
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        }
    }
}));

const SearchLayout = memo(() => {
    const styles = useStyles();

    const [searchText, setSearchText] = useState('');
    const debouncedSearchtext = useDebounce(searchText, 500);

    const { data, loading: isLoading } = useQuery(SearchQuery, { variables: { searchText: debouncedSearchtext }, skip: !debouncedSearchtext });

    return (
        <>
            <BaseLayoutMainContent>
                <Grid container style={{ backgroundColor: '#fff' }}>
                    <Grid item xs className={styles.subheader}>
                        <Typography variant={'h2'} className={styles.bannerheading}>
                            Suche
                        </Typography>
                    </Grid>
                    <Grid item xs={false} sm={4} xl={3} className={styles.userNavigationGridItem}>
                        <UserNavigation />
                    </Grid>
                </Grid>
                <section style={{ backgroundColor: '#fff', marginBottom: '1em', padding: '8px' }}>
                    <TextField fullWidth variant={'outlined'} id={'searchfield'} label={'Suchbegriff'} type={'search'} value={searchText} onChange={e => setSearchText(e.target.value)} />
                    <Typography variant={'body1'}>
                        {isLoading && <span><CircularProgress style={{ height: '1em', width: '1em' }} /> Beiträge werden gesucht ...</span>}
                        {!isLoading && data && <span>Es wurden {data.results.length} Beiträge gefunden</span>}
                        {!isLoading && !data && <span>&nbsp;</span>}
                    </Typography>
                </section>
                <section>
                    {data?.results.map((article: ArticleModel) =>
                        <ArticlePreviewDensedLayout key={article.id} article={article} disableEdit disablePin />
                    )}
                </section>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar isEmpty />
        </>
    );
});
export default SearchLayout;
