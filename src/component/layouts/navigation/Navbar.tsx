import React, { memo, useCallback } from 'react';
import { AppBar, Toolbar, Button, Theme, Grid, IconButton } from '@material-ui/core';
import { CollisionLink } from 'component/general/CollisionLink';
import { createOpenDrawerAction } from 'store/actions/layout';
import { makeStyles } from '@material-ui/styles';
import { Menu } from '@material-ui/icons';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from '../../../util/path/useCurrentCategoryId';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useCategories } from 'util/categories/useCategories';

const useStyles = makeStyles<Theme>(theme => ({
    root: {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        '& a': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),

        }
    },
    appBar: {
        backgroundColor: '#333',
    },
    padding: {
        [theme.breakpoints.down('sm')]: {
            paddingRight: '3em'
        },
    },
    secondaryAppBar: {
        backgroundColor: '#fffffff0',
        maxHeight: 40,
        borderTop: `1.5px solid ${theme.palette.secondary.main}`,
        boxShadow: '0px 2px 2px #0000002b',
    },
    navButton: {
        flexGrow: 1,
        flexShrink: 0,
        color: theme.palette.primary.contrastText,
        border: '1px solid #333',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        '&.selected': {
            border: `1px solid ${theme.palette.secondary.main}`,
            color: '#fff'
        }
    },
    navButtonSecond: {
        flexGrow: 1,
        flexShrink: 0,
        color: theme.palette.primary.dark,
        '&.selected': {
            color: theme.palette.secondary.main,
            fontWeight: '600',
        }
    },
    mobileBurgerMenuButton: {
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.primary.main,
        alignItems: 'center',
        boxShadow: '-2px 0px 2px #00000057',
        display: 'none',
        height: '100%',
        zIndex: 10000,
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
            width: '3em'
        },
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
        }
    }
}));

export const Navbar = memo(() => {

    const styles = useStyles();

    const categories = useCategories();

    const currentCategoryId = useCurrentCategoryId();
    const categoriesAncestors = useCategoriesAncestorsForItem(currentCategoryId || 0);

    const dispatch = useDispatch();

    const openDrawer = useCallback(() => { dispatch(createOpenDrawerAction()); }, [dispatch]);

    const categoriesHierarchy = [...categoriesAncestors, currentCategoryId];

    const homepageCategory = (categories || []).find(category => category.isHomepage);
    const mainCategories = (categories || []).filter(category => !Boolean(category.category) && !category.isSidenav && !category.isHomepage);
    const subcategories = (categories || []).filter(category => category.category && category.category.id === categoriesHierarchy[0]);

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
                                    className={classNames(styles.navButton, { selected: currentCategoryId === null })}
                                    color='inherit'
                                >
                                    {homepageCategory.title}
                                </Button>
                            )}
                            {mainCategories.map(category => (
                                <Button
                                    variant="text"
                                    key={category.id}
                                    component={CollisionLink}
                                    to={category.redirect ? category.redirect : `/category/${category.id}`}
                                    size={'medium'}
                                    className={classNames(styles.navButton, { selected: categoriesHierarchy.indexOf(category.id) > -1 })}
                                >
                                    {category.title}
                                </Button>
                            ))}
                            <Button className={styles.placeholder}>{''}</Button>
                        </Toolbar>
                    </AppBar>
                </Grid>
                <Grid item xs={2} sm={1} className={styles.mobileBurgerMenuButton}>
                    <IconButton size={'small'} onClick={() => openDrawer()} style={{ margin: '0 auto' }}>
                        <Menu className={classNames(styles.menu)} />
                    </IconButton>
                </Grid>
            </Grid>
            {subcategories.length > 0 && (
                <AppBar position={'sticky'} className={styles.secondaryAppBar}>
                    <Toolbar style={{ minHeight: '0', height: '40px' }}>
                        {subcategories.map(category => (
                            <Button
                                variant="text"
                                key={category.id}
                                component={CollisionLink}
                                to={category.redirect ? category.redirect : `/category/${category.id}`}
                                size={'small'}
                                className={classNames(styles.navButtonSecond, { selected: categoriesHierarchy.indexOf(category.id) > -1 })}
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