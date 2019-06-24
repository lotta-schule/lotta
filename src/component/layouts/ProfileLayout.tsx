import { ConnectedBaseLayout } from './ConnectedBaseLayout';
import React, { FunctionComponent, memo } from 'react';
import { Card, CardContent, Typography, TextField, Button, Avatar, Fab,} from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';

export interface ProfileLayoutProps {
}

export const ProfileLayout: FunctionComponent<ProfileLayoutProps> = memo(() => {
    return (
        <ConnectedBaseLayout>
            <Card>
                <CardContent>
                    <Typography variant={'h4'}>Meine Daten</Typography>
                    <Grid container>
                        <Grid md={4} style={{marginTop: '1em'}}>
                            <Avatar alt={'Nutzer Name'} src={`https://avatars.dicebear.com/v2/avataaars/efinbild.svg`} style={{ float: 'left'}} />
                            <Fab color="secondary" aria-label="Edit" size="small">
                                 <Edit />
                            </Fab>
                        </Grid>
                        <Grid md={8}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Dein Vor- und Nachname"
                                placeholder="Minnie Musterchen"
                                type="name"
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="nickname"
                                label="Dein Nickname"
                                placeholder="El Professore"
                                type="nickname"
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="Deine Email-Adresse:"
                                placeholder="beispiel@medienportal.org"
                                type="email"
                                fullWidth
                            />
                            <Button
                                type={'submit'}
                                disabled={false}
                                color="secondary"
                                variant="contained"
                                style={{float: 'right'}}
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
        </ConnectedBaseLayout>
    );
});