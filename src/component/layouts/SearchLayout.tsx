import React, { memo, useState } from 'react';
import { CircularProgress, TextField, Typography, makeStyles } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { ArticlePreviewDensedLayout } from 'component/article/ArticlePreviewDensedLayout';
import { ArticleModel } from 'model';
import { useDebounce } from 'util/useDebounce';
import { SearchQuery } from 'api/query/SearchQuery';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { Header } from '../general/Header';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import searchBannerImage from './searchBanner.png';

const useStyles = makeStyles(theme => ({
    inputSection: {
        backgroundColor: '#fff',
        marginBottom: '1em',
        padding: '8px'
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

                <Header bannerImageUrl={searchBannerImage}>
                    <Typography variant={'h2'}>Suche</Typography>
                </Header>

                <section className={styles.inputSection}>
                    <TextField
                        fullWidth
                        autoFocus
                        variant={'outlined'}
                        id={'searchfield'}
                        label={'Suchbegriff'}
                        type={'search'}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Typography variant={'body1'} component={'div'}>
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
