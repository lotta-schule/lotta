import React, { FunctionComponent, memo, useCallback } from 'react';
import { AppBar, Toolbar, Button, Theme, Grid, IconButton } from '@material-ui/core';
import { CategoryModel } from '../../../model';
import { CollisionLink } from 'component/general/CollisionLink';
import { createOpenDrawerAction } from 'store/actions/layout';
import { makeStyles } from '@material-ui/styles';
import { Menu } from '@material-ui/icons';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from '../../../util/path/useCurrentCategoryId';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { height } from '@material-ui/system';

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
        backgroundColor: theme.palette.primary.main,
    },
    padding: {
        [theme.breakpoints.down('sm')]: {
            paddingRight: '3em'
        },
    },
    secondaryAppBar: {
        backgroundColor: '#fff',
        maxHeight: '40px',
    },
    navButton: {
        '&:h^': {
            backgroundColor: '#ffffff21'
        },
        '&.selected': {
            backgroundColor: '#ffffff21'
        }
    },
    navButtonSecond: {
        flexGrow: 1,
        flexShrink: 0,
        '&.selected': {
            backgroundColor: '#b9b9b954'
        }
    },
    mobileBurgerMenuButton: {
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.primary.main,
        alignItems: 'center',
        boxShadow: '-3px 0px 7px #00000063',
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
    }
}));

export interface NavbarProps {
    categories?: CategoryModel[];
}

export const Navbar: FunctionComponent<NavbarProps> = memo(({ categories }) => {

    const styles = useStyles();

    const currentCategoryId = useCurrentCategoryId();
    const categoriesAncestors = useCategoriesAncestorsForItem(currentCategoryId || '');

    const dispatch = useDispatch();

    const openDrawer = useCallback(() => { dispatch(createOpenDrawerAction()); }, [dispatch]);

    const categoriesHierarchy = [...categoriesAncestors, currentCategoryId];

    const mainCategories = (categories || []).filter(category => !Boolean(category.category));
    const subcategories = (categories || []).filter(category => category.category && category.category.id === categoriesHierarchy[0]);

    return (
        <nav className={styles.root}>
            <Grid container style={{ position: 'relative' }}>
                <Grid item xs className={styles.padding}>
                    <AppBar position={'sticky'} className={styles.appBar}>
                        <Toolbar>
                            <Button
                                key={'home'}
                                component={CollisionLink}
                                style={{ flexGrow: 1, flexShrink: 0, color: '#fff' }}
                                to={'/'}
                                variant="text"
                                size={'medium'}
                                className={styles.navButton}
                                color='inherit'
                            >
                                Startseite
                            </Button>
                            {mainCategories.map(category => (
                                <Button
                                    variant="text"
                                    key={category.id}
                                    component={CollisionLink}
                                    style={{ flexGrow: 1, flexShrink: 0, color: '#fff' }}
                                    to={category.redirect ? category.redirect : `/category/${category.id}`}
                                    size={'medium'}
                                    className={classNames(styles.navButton, { selected: categoriesHierarchy.indexOf(category.id) > -1 })}
                                >
                                    {category.title}
                                </Button>
                            ))}
                            <Button className={styles.placeholder}>
                            </Button>
                        </Toolbar>
                    </AppBar>
                </Grid>
                <Grid item xs={2} sm={1} alignItems={'center'} className={styles.mobileBurgerMenuButton}>
                    <IconButton size={'small'} onClick={() => openDrawer()} style={{ margin: '0 auto' }}>
                        <Menu style={{ color: '#fff' }} />
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