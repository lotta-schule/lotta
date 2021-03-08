import React, { memo, useCallback } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    Theme,
    Grid,
    IconButton,
} from '@material-ui/core';
import { CollisionLink } from 'component/general/CollisionLink';
import { makeStyles } from '@material-ui/styles';
import { Menu } from '@material-ui/icons';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from '../../../util/path/useCurrentCategoryId';
import { useCategories } from 'util/categories/useCategories';
import { fade } from '@material-ui/core/styles';
import { Category } from 'util/model';
import { useApolloClient } from '@apollo/client';
import clsx from 'clsx';
import { gql } from '@apollo/client';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        position: 'sticky',
        top: 0,
        zIndex: 2000,
        '& a': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
    },
    padding: {
        [theme.breakpoints.down('sm')]: {
            paddingRight: '3em',
        },
    },
    secondaryAppBar: {
        backgroundColor: fade(theme.palette.background.paper, 0.9),
        maxHeight: 40,
        borderTop: `1.5px solid ${theme.palette.secondary.main}`,
        boxShadow: `0px 2px 2px ${fade(theme.palette.text.primary, 0.2)}`,
    },
    navButton: {
        flexGrow: 1,
        flexShrink: 0,
        color: theme.palette.primary.contrastText,
        border: `1px solid transparent`,
        '&:hover': {
            backgroundColor: fade(theme.palette.background.paper, 0.08),
        },
        '&.selected': {
            border: `1px solid ${theme.palette.secondary.main}`,
            color: theme.palette.secondary.contrastText,
        },
    },
    navButtonSecond: {
        flexGrow: 1,
        flexShrink: 0,
        color: theme.palette.primary.dark,
        '&.selected': {
            color: theme.palette.secondary.main,
            fontWeight: '600',
        },
    },
    mobileBurgerMenuButton: {
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.primary.main,
        alignItems: 'center',
        boxShadow: '-2px 0px 2px #00000057',
        display: 'none',
        height: '100%',
        zIndex: 2001,
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            width: '3em',
        },
    },
    iconButton: {
        color: theme.palette.primary.contrastText,
    },
    placeholder: {
        display: 'none',
        [theme.breakpoints.down('sm')]: {
            minWidth: 1,
            padding: 0,
            height: '100%',
            display: 'flex',
        },
        menu: {
            color: theme.palette.primary.contrastText,
        },
    },
}));

export const Navbar = memo(() => {
    const styles = useStyles();

    const apolloClient = useApolloClient();
    const [categories] = useCategories();
    const currentCategoryId = useCurrentCategoryId();
    const categoriesAncestors = useCategoriesAncestorsForItem(
        currentCategoryId || '0'
    );

    const openDrawer = useCallback(() => {
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

    return (
        <nav className={styles.root}>
            <Grid container style={{ position: 'relative' }}>
                <Grid item xs className={styles.padding}>
                    <AppBar position={'sticky'} className={styles.appBar}>
                        <Toolbar>
                            {homepageCategory && (
                                <Button
                                    key={'home'}
                                    component={CollisionLink}
                                    to={'/'}
                                    variant="text"
                                    size={'medium'}
                                    className={clsx(styles.navButton, {
                                        selected: currentCategoryId === null,
                                    })}
                                    color="inherit"
                                >
                                    {homepageCategory.title}
                                </Button>
                            )}
                            {mainCategories.map((category) => (
                                <Button
                                    variant="text"
                                    key={category.id}
                                    component={CollisionLink}
                                    to={
                                        category.redirect
                                            ? category.redirect
                                            : Category.getPath(category)
                                    }
                                    size={'medium'}
                                    className={clsx(styles.navButton, {
                                        selected:
                                            categoriesHierarchy.indexOf(
                                                category.id
                                            ) > -1,
                                    })}
                                >
                                    {category.title}
                                </Button>
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
                    <IconButton
                        className={styles.iconButton}
                        size={'small'}
                        onClick={() => openDrawer()}
                        style={{ margin: '0 auto' }}
                    >
                        <Menu className={clsx(styles.menu)} />
                    </IconButton>
                </Grid>
            </Grid>
            {subcategories.length > 0 && (
                <AppBar position={'sticky'} className={styles.secondaryAppBar}>
                    <Toolbar style={{ minHeight: '0', height: '40px' }}>
                        {subcategories.map((category) => (
                            <Button
                                variant="text"
                                key={category.id}
                                component={CollisionLink}
                                to={
                                    category.redirect
                                        ? category.redirect
                                        : Category.getPath(category)
                                }
                                size={'small'}
                                className={clsx(styles.navButtonSecond, {
                                    selected:
                                        categoriesHierarchy.indexOf(
                                            category.id
                                        ) > -1,
                                })}
                            >
                                {category.title}
                            </Button>
                        ))}
                    </Toolbar>
                </AppBar>
            )}
        </nav>
    );
});
