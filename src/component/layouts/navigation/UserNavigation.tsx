import React, { FunctionComponent, memo } from 'react';
import { Grid, Typography, Avatar } from '@material-ui/core';

export const UserNavigation: FunctionComponent = memo(() => (
    <Grid container>
        <Grid item xs style={{ display: 'flex' }} justify={'center'}>
            <Typography variant={'body1'} align={'center'}>
                <Avatar alt={'Nutzer Name'} src={'https://avatars.dicebear.com/v2/avataaars/medienportal.svg'} />
                Profil
            </Typography>
        </Grid>
        <Grid item xs>
            <Typography variant={'body1'} component={'nav'} align={'right'}>
                <ul>
                    <li>Abmelden</li>
                    <li>Impressum</li>
                    <li>Datenschutz</li>
                    <li>Suche</li>
                </ul>
            </Typography>
        </Grid>
    </Grid>
));