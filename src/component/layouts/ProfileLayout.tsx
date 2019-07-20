import React, { FunctionComponent, memo, useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Avatar, Fab, } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { useSelector } from 'react-redux';
import { UserModel } from 'model';
import { State } from 'store/State';
import useRouter from 'use-react-router';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';

export interface ProfileLayoutProps {
}

export const ProfileLayout: FunctionComponent<ProfileLayoutProps> = memo(() => {
    const user = useSelector<State, UserModel | null>(s => s.user.user);
    const [email, setEmail] = useState(user && user.email);
    const [name, setName] = useState(user && user.name);
    const [nickname, setNickname] = useState(user && user.nickname);
    const { history } = useRouter();
    if (!user) {
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
                                <Avatar alt={'Nutzer Name'} src={`https://avatars.dicebear.com/v2/avataaars/${email}.svg`} style={{ float: 'left' }} />
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