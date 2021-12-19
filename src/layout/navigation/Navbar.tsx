import * as React from 'react';
import { AppBar, Toolbar, Grid } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from '../../util/path/useCurrentCategoryId';
import { useCategories } from 'util/categories/useCategories';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { NavigationButton } from 'shared/general/button/NavigationButton';
import { Category } from 'util/model';
import { Button } from 'shared/general/button/Button';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import styles from './Navbar.module.scss';

export const Navbar = React.memo(() => {
    const wrapperRef = React.useRef<HTMLElement>(null);

    const apolloClient = useApolloClient();
    const router = useRouter();
    const path = router.asPath;

    const isHomepage = path === '/';

    const [categories] = useCategories();
    const currentCategoryId = useCurrentCategoryId();
    const categoriesAncestors = useCategoriesAncestorsForItem(
        currentCategoryId || '0'
    );

    const openDrawer = React.useCallback(() => {
        apolloClient.writeQuery({
            query: gql`
                {
                    isMobileDrawerOpen
                }
            `,
            data: { isMobileDrawerOpen: true },
        });
    }, [apolloClient]);

    const categoriesHierarchy = [...categoriesAncestors, currentCategoryId];

    const homepageCategory = (categories || []).find(
        (category) => category.isHomepage
    );
    const mainCategories = (categories || []).filter(
        (category) =>
            !Boolean(category.category) &&
            !category.isSidenav &&
            !category.isHomepage
    );
    const subcategories = (categories || []).filter(
        (category) =>
            category.category && category.category.id === categoriesHierarchy[0]
    );

    const scrollNavitemIntoView = (el: HTMLElement) => {
        const container = el.parentElement?.parentElement;
        container?.scroll?.({
            left: el.offsetLeft - el.clientWidth + 8,
            behavior: 'smooth',
        });
    };

    React.useEffect(() => {
        wrapperRef.current
            ?.querySelectorAll<HTMLElement>('.selected')
            .forEach((selectedNavItem) => {
                scrollNavitemIntoView(selectedNavItem);
            });
    }, [currentCategoryId, categories]);

    return (
        <nav className={clsx(styles.root, 'navbar')} ref={wrapperRef}>
            <Grid container style={{ position: 'relative' }}>
                <Grid item xs className={styles.padding}>
                    <AppBar position={'sticky'}>
                        <Toolbar>
                            {homepageCategory && (
                                <Link href={'/'} passHref>
                                    <NavigationButton
                                        key={'home'}
                                        className={clsx(styles.navButton, {
                                            selected: isHomepage,
                                        })}
                                    >
                                        {homepageCategory.title}
                                    </NavigationButton>
                                </Link>
                            )}
                            {mainCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={
                                        category.redirect
                                            ? category.redirect
                                            : Category.getPath(category)
                                    }
                                    passHref
                                >
                                    <NavigationButton
                                        className={clsx(styles.navButton, {
                                            selected:
                                                categoriesHierarchy.indexOf(
                                                    category.id
                                                ) > -1,
                                        })}
                                    >
                                        {category.title}
                                    </NavigationButton>
                                </Link>
                            ))}
                            <Button className={styles.placeholder}>{''}</Button>
                        </Toolbar>
                    </AppBar>
                </Grid>
                <Grid
                    item
                    xs={2}
                    sm={1}
                    className={styles.mobileBurgerMenuButton}
                >
                    <Button
                        data-testid={'MobileMenuButton'}
                        className={styles.iconButton}
                        onClick={() => openDrawer()}
                        style={{ margin: '0 auto' }}
                        icon={<Menu className={clsx(styles.menu)} />}
                    />
                </Grid>
            </Grid>
            {subcategories.length > 0 && (
                <AppBar
                    data-testid={'nav-level2'}
                    position={'sticky'}
                    className={styles.secondaryAppBar}
                >
                    <Toolbar style={{ minHeight: '0', height: '40px' }}>
                        {subcategories.map((category) => (
                            <Link
                                key={category.id}
                                href={
                                    category.redirect
                                        ? category.redirect
                                        : Category.getPath(category)
                                }
                                passHref
                            >
                                <NavigationButton
                                    key={category.id}
                                    className={clsx(
                                        styles.navButtonSecond,
                                        'secondary',
                                        'small',
                                        {
                                            selected:
                                                categoriesHierarchy.indexOf(
                                                    category.id
                                                ) > -1,
                                        }
                                    )}
                                >
                                    {category.title}
                                </NavigationButton>
                            </Link>
                        ))}
                    </Toolbar>
                </AppBar>
            )}
        </nav>
    );
});
Navbar.displayName = 'Navbar';
