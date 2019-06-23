import React, { FunctionComponent, memo, useState } from 'react';
import { Grid, Typography, Avatar, Link, makeStyles, Button } from '@material-ui/core';
import { UserModel } from '../../../model';
import { CollisionLink } from '../../general/CollisionLink';
import { LoginDialog } from '../../dialog/LoginDialog';
import { CreateArticleDialog } from 'component/dialog/CreateArticleDialog';
import { useDispatch } from 'react-redux';
import useRouter from 'use-react-router';
import { createAddArticleAction } from 'store/actions/content';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'sticky',
        top: (theme.mixins.toolbar.minHeight as number) + theme.spacing(2)
    }
}));

export interface UserNavigationProps {
    user: UserModel | null;
    onLogin(user: UserModel, token: string): void;
    onLogout(): void;
}

export const UserNavigation: FunctionComponent<UserNavigationProps> = memo(({ user, onLogin, onLogout }) => {
    const styles = useStyles();

    const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
    const [createArticleModalIsOpen, setCreateArticleModalIsOpen] = useState(false);
    const { history } = useRouter();
    const dispatch = useDispatch();
    return (
        <>
            <Grid container justify={'space-evenly'} className={styles.root}>
                <Grid item xs style={{ display: 'flex' }}>
                    {user && (
                        <div>
                            <Avatar alt={'Nutzer Name'} src={`https://avatars.dicebear.com/v2/avataaars/${user.email}.svg`} />
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
                                <>
                                    <li><Link onClick={() => setLoginModalIsOpen(true)}>Anmelden</Link></li>
                                </>
                            }
                            <li>Impressum</li>
                            <li>Datenschutz</li>
                            {user && (
                                <>
                                    <li>
                                        <Button onClick={() => setCreateArticleModalIsOpen(true)}>+ Artikel</Button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
            <CreateArticleDialog
                isOpen={createArticleModalIsOpen}
                onAbort={() => setCreateArticleModalIsOpen(false)}
                onConfirm={article => {
                    dispatch(createAddArticleAction(article));
                    history.push(`/article/${article.id}`);
                }}
            />
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