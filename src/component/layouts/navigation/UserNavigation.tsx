import React, { FunctionComponent, memo, useState } from 'react';
import { Grid, Typography, Avatar, Link as MuiLink } from '@material-ui/core';
import { UserModel } from '../../../model';
import { Link } from '../../general/Link';
import { LoginDialog } from '../../dialog/LoginDialog';

export interface UserNavigationProps {
    user: UserModel | null;
    onLogin(user: UserModel, token: string): void;
    onLogout(): void;
}

export const UserNavigation: FunctionComponent<UserNavigationProps> = memo(({ user, onLogin, onLogout }) => {
    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    return (
        <>
            <Grid container justify={'space-evenly'}>
                <Grid item xs style={{ display: 'flex' }}>
                    {user && (
                        <div>
                            <Avatar alt={'Nutzer Name'} src={'https://avatars.dicebear.com/v2/avataaars/medienportal.svg'} />
                            <Typography align={'center'}>
                                <Link to={'/profile'}>
                                    Profil
                        </Link>
                            </Typography>
                        </div>
                    )}
                </Grid>
                <Grid item xs>
                    <Typography variant={'body1'} component={'nav'} align={'right'}>
                        <ul>
                            {user ?
                                <li><MuiLink onClick={() => onLogout()}>Abmelden</MuiLink></li> :
                                <li><MuiLink onClick={() => setLoginModalIsOpen(true)}>Anmelden</MuiLink></li>
                            }
                            <li>Impressum</li>
                            <li>Datenschutz</li>
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
            <LoginDialog
                isOpen={loginModalIsOpen}
                onAbort={() => setLoginModalIsOpen(false)}
                onLogin={(user, token) => {
                    setLoginModalIsOpen(false);
                    onLogin(user, token);
                }}
            />
        </>
    );
});