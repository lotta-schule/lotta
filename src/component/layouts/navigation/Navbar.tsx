import React, { FunctionComponent, memo } from 'react';
import { AppBar, Toolbar, Button, Theme } from '@material-ui/core';
import { CategoryModel } from '../../../model';
import { CollisionLink } from 'component/general/CollisionLink';
import { useCurrentCategoryId } from '../../../util/path/useCurrentCategoryId';
import { makeStyles } from '@material-ui/styles';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import clsx from 'clsx';

const useStyles = makeStyles<Theme>(theme => ({
    root: {
        position: 'sticky',
        top: 0,
        '& a': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            '&.selected': {
                backgroundColor: '#ffffff21'
            }
        }
    },
    appBar: {
        backgroundColor: theme.palette.primary.main,
    },
    secondaryAppBar: {
        backgroundColor: theme.palette.secondary.main
    },
    navButton: {
        '&:hover': {
            backgroundColor: '#ffffff21'
        }
    }
}));

export interface NavbarProps {
    categories?: CategoryModel[];
}

export const Navbar: FunctionComponent<NavbarProps> = memo(({ categories }) => {

    const styles = useStyles();

    const currentCategoryId = useCurrentCategoryId();
    const categoriesAncestors = useCategoriesAncestorsForItem(currentCategoryId || '')
    const categoriesHierarchy = [...categoriesAncestors, currentCategoryId]

    const mainCategories = (categories || []).filter(category => !Boolean(category.categoryId));
    let subcategories = (categories || []).filter(category => category.categoryId === categoriesHierarchy[0]);


    return (
        <nav className={styles.root}>
            <AppBar position={'sticky'} className={styles.appBar}>
                <Toolbar>
                    <Button
                        key={'home'}
                        component={CollisionLink}
                        style={{ flexGrow: 1, flexShrink: 0 }}
                        to={'/'}
                        color={'inherit'}
                        size={'medium'}
                        className={styles.navButton}
                    >
                        Startseite
                    </Button>
                    {mainCategories.map(category => (
                        <Button
                            key={category.id}
                            component={CollisionLink}
                            style={{ flexGrow: 1, flexShrink: 0 }}
                            to={`/category/${category.id}`}
                            color={'inherit'}
                            size={'medium'}
                            className={clsx(styles.navButton, { selected: categoriesHierarchy[0] === category.id })}
                        >
                            {category.title}
                        </Button>
                    ))}
                </Toolbar>
            </AppBar>
            {subcategories.length > 0 && (
                <AppBar position={'sticky'} color={'secondary'} className={styles.secondaryAppBar}>
                    <Toolbar variant={'dense'}>
                        {subcategories.map(category => (
                            <Button
                                key={category.id}
                                component={CollisionLink}
                                style={{ flexGrow: 1, flexShrink: 0, color: 'white' }}
                                to={`/category/${category.id}`}
                                size={'small'}
                                className={clsx(styles.navButton, { selected: categoriesHierarchy[1] === category.id })}
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