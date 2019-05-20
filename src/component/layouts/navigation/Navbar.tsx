import React, { FunctionComponent, memo } from 'react';
import { AppBar, Toolbar, Button } from '@material-ui/core';
import { CategoryModel } from '../../../model';
import { CollisionLink } from 'component/general/CollisionLink';

export interface NavbarProps {
    categories?: CategoryModel[];
}

export const Navbar: FunctionComponent<NavbarProps> = memo(({ categories }) => {
    return (
        <AppBar position={'sticky'}>
            <Toolbar>
                {categories && categories.map(category => (
                    <Button
                        key={category.id}
                        component={CollisionLink}
                        to={'/category'}
                        color={'inherit'}
                    >
                        {category.title}
                    </Button>
                ))}
            </Toolbar>
        </AppBar>
    );
});