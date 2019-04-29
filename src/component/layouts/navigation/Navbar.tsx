import React, { FunctionComponent, memo } from 'react';
import { AppBar, Toolbar, Button } from '@material-ui/core';

export interface NavbarProps { }

export const Navbar: FunctionComponent<NavbarProps> = memo(() => {
    return (
        <AppBar position={'sticky'}>
            <Toolbar>
                <Button color="inherit">Startseite</Button>
                <Button color="inherit">Profil</Button>
                <Button color="inherit">GTA</Button>
                <Button color="inherit">Projekte</Button>
                <Button color="inherit">Fächer</Button>
                <Button color="inherit">Material</Button>
                <Button color="inherit">Galerien</Button>
            </Toolbar>
        </AppBar>
    );
});