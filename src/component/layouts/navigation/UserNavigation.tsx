import React, { FunctionComponent, memo, useState } from 'react';
import { Grid, Typography, Avatar, Link } from '@material-ui/core';
import { UserModel } from '../../../model';
import { CollisionLink } from '../../general/CollisionLink';
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
                            <Avatar alt={'Nutzer Name'} src={user.avatar} />
                            <Typography align={'center'}>
                                <Link component={CollisionLink} to={'/profile'}>
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
                                <li><Link onClick={() => onLogout()}>Abmelden</Link></li> :
                                <li><Link onClick={() => setLoginModalIsOpen(true)}>Anmelden</Link></li>
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