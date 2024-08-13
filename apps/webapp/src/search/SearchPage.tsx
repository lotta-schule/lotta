import * as React from 'react';
import {
  Button,
  Label,
  Input,
  CircularProgress,
  useDebounce,
} from '@lotta-schule/hubert';
import { useQuery } from '@apollo/client';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { ArticleModel, CategoryModel } from 'model';
import { Icon } from 'shared/Icon';
import { LegacyHeader, Main, Sidebar } from 'layout';
import { CategorySelect } from 'shared/categorySelect/CategorySelect';
import { ArticlePreview } from 'article/preview';

import SearchQuery from 'api/query/SearchQuery.graphql';

import styles from './SearchPage.module.scss';

export const SearchPage = () => {
  const [searchText, setSearchText] = React.useState('');
  const [isAdvancedSearchFormVisible, setIsAdvancedSearchFormVisible] =
    React.useState(false);
  const [category, setCategory] = React.useState<CategoryModel | null>(null);
  const debouncedSearchtext = useDebounce(searchText, 500);

  const { data, loading: isLoading } = useQuery(SearchQuery, {
    variables: {
      searchText: debouncedSearchtext,
      options: { categoryId: category?.id ?? null },
    },
    skip: !debouncedSearchtext,
  });

  return (
    <>
      <Main className={styles.root}>
        <LegacyHeader bannerImageUrl={'/searchBanner.png'}>
          <h2>Suche</h2>
        </LegacyHeader>

        <section className={styles.inputSection}>
          <div className={styles.description}>
            Gib ein oder mehrere Suchbegriffe in das Suchfeld ein.
          </div>
          <Label label={'Suchbegriff'}>
            <Input
              autoFocus
              id={'searchfield'}
              type={'search'}
              value={searchText}
              placeholder={'Suchbegriff'}
              onChange={(e) => setSearchText(e.currentTarget.value)}
            />
          </Label>
          <Button
            className={styles.advancedSettingsButton}
            onClick={() =>
              setIsAdvancedSearchFormVisible(!isAdvancedSearchFormVisible)
            }
            icon={
              isAdvancedSearchFormVisible ? (
                <Icon icon={faCaretDown} size={'lg'} />
              ) : (
                <Icon icon={faCaretUp} size={'lg'} />
              )
            }
          >
            erweiterte Suche
          </Button>
          <motion.div
            className={styles.advancedSettings}
            initial={'closed'}
            aria-expanded={isAdvancedSearchFormVisible}
            animate={isAdvancedSearchFormVisible ? 'open' : 'closed'}
            variants={{
              open: { opacity: 0, height: 0 },
              closed: { opacity: 1, height: 'auto' },
            }}
            data-testid={'advanced-search'}
          >
            <h3>Erweiterte Suche</h3>
            <CategorySelect
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </motion.div>

          <motion.div
            className={styles.result}
            initial={'closed'}
            animate={isLoading || data ? 'open' : 'closed'}
            variants={{
              open: { opacity: 1, height: 'auto' },
              closed: { opacity: 0, height: 0 },
            }}
          >
            {isLoading && (
              <span>
                <CircularProgress
                  size={'1em'}
                  style={{ display: 'inline-block' }}
                  isIndeterminate
                  aria-label={'Suche läuft'}
                />{' '}
                Beiträge werden gesucht ...
              </span>
            )}
            {!isLoading && data && (
              <span>Es wurden {data.results.length} Beiträge gefunden</span>
            )}
            {!isLoading && !data && <span>&nbsp;</span>}
          </motion.div>
        </section>
        <section>
          {data?.results.map((article: ArticleModel, i: number) => (
            <AnimatePresence key={article.id}>
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                exit={{ opacity: 0, y: -50 }}
              >
                <ArticlePreview
                  layout={'densed'}
                  article={article}
                  disableEdit
                  disablePin
                />
              </motion.div>
            </AnimatePresence>
          ))}
        </section>
      </Main>
      <Sidebar isEmpty />
    </>
  );
};
