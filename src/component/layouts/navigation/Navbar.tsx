import React, { FunctionComponent, memo } from 'react';
import { AppBar, Toolbar, Button } from '@material-ui/core';
import { CategoryModel } from '../../../model';
import { Link } from 'react-router-dom';

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
                        component={({ children, href, ...props }) => <Link to={href!} {...props}>{children}</Link>}
                        href={'/category'}
                        color={'inherit'}
                    >
                        {category.title}
                    </Button>
                ))}
            </Toolbar>
        </AppBar>
    );
});