import React, { FunctionComponent, memo, useState } from 'react';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { Card, CardContent, Typography, TextField, Button, Fab, } from '@material-ui/core';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { Edit } from '@material-ui/icons';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { Grid } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import useRouter from 'use-react-router';

export interface ProfileLayoutProps {
}

export const ProfileLayout: FunctionComponent<ProfileLayoutProps> = memo(() => {
    const currentUser = useCurrentUser();
    const [email, setEmail] = useState(currentUser && currentUser.email);
    const [name, setName] = useState(currentUser && User.getNickname(currentUser));
    const [nickname, setNickname] = useState(currentUser && currentUser.nickname);
    const { history } = useRouter();
    if (!currentUser) {
        history.replace('/');
        return <div></div>;
    }
    return (
        <>
            <BaseLayoutMainContent>
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Meine Daten</Typography>
                        <Grid container>
                            <Grid item md={4} style={{ marginTop: '1em' }}>
                                <CurrentUserAvatar style={{ float: 'left' }} />
                                <Fab color="secondary" aria-label="Edit" size="small">
                                    <Edit />
                                </Fab>
                            </Grid>
                            <Grid item md={8}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    label="Dein Vor- und Nachname"
                                    placeholder="Minnie Musterchen"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    type="name"
                                    fullWidth
                                />
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="nickname"
                                    label="Dein Spitzname"
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    placeholder="El Professore"
                                    type="nickname"
                                    fullWidth
                                />
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="email"
                                    label="Deine Email-Adresse:"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="beispiel@medienportal.org"
                                    type="email"
                                    fullWidth
                                />
                                <Button
                                    type={'submit'}
                                    disabled={false}
                                    color="secondary"
                                    variant="contained"
                                    style={{ float: 'right' }}
                                >
                                    Speichern
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Meine Medien</Typography>
                        <FileExplorer />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Geteilte Medien</Typography>
                        <FileExplorer />
                    </CardContent>
                </Card>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar />
        </>
    );
});