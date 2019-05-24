import React, { FunctionComponent, memo } from 'react';
import { AppBar, Toolbar, Button, Theme } from '@material-ui/core';
import { CategoryModel } from '../../../model';
import { CollisionLink } from 'component/general/CollisionLink';
import { useCurrentCategoryId } from '../../../util/path/useCurrentCategoryId';
import { makeStyles } from '@material-ui/styles';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';

const useStyles = makeStyles<Theme>(theme => ({
    root: {
        position: 'sticky',
        top: 0,
        '& a': {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2)
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
            <AppBar position={'static'}>
                <Toolbar>
                    <Button
                        key={'home'}
                        component={CollisionLink}
                        style={{ flexGrow: 1, flexShrink: 0 }}
                        to={'/'}
                        color={'inherit'}
                        size={'medium'}
                    >
                        Startseite
                    </Button>
                    {mainCategories.map(category => (
                        <Button
                            key={category.id}
                            component={CollisionLink}
                            style={{ flexGrow: 1, flexShrink: 0 }}
                            to={`/category/${category.id}`}
                            color={categoriesHierarchy[0] === category.id ? 'default' : 'inherit'}
                            size={'medium'}
                        >
                            {category.title}
                        </Button>
                    ))}
                </Toolbar>
            </AppBar>
            {subcategories.length > 0 && (
                <AppBar position={'sticky'} color={'secondary'}>
                    <Toolbar variant={'dense'}>
                        {subcategories.map(category => (
                            <Button
                                key={category.id}
                                component={CollisionLink}
                                style={{ flexGrow: 1, flexShrink: 0 }}
                                to={`/category/${category.id}`}
                                color={categoriesHierarchy[1] === category.id ? 'secondary' : 'secondary'}
                                variant={'contained'}
                                size={'small'}
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