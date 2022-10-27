import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from '../../util/path/useCurrentCategoryId';
import { useCategories } from 'util/categories/useCategories';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button, NavigationButton } from '@lotta-schule/hubert';
import { Category } from 'util/model';
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
            <div className={styles.gridContainer}>
                <div>
                    <nav className={styles.navbar}>
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
                    </nav>
                </div>
                <div className={styles.mobileBurgerMenuButton}>
                    <Button
                        data-testid={'MobileMenuButton'}
                        className={styles.iconButton}
                        onClick={() => openDrawer()}
                        style={{ margin: '0 auto' }}
                        icon={<Icon icon={faBars} size="lg" />}
                    />
                </div>
            </div>
            {subcategories.length > 0 && (
                <nav
                    data-testid={'nav-level2'}
                    className={styles.secondaryAppBar}
                >
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
                </nav>
            )}
        </nav>
    );
});
Navbar.displayName = 'Navbar';
