import React, { memo, useState } from 'react';
import { Avatar, Button, Card, CardContent, Checkbox, FormGroup, FormControlLabel, Grid, TextField, Typography, Fab } from '@material-ui/core';
import { useMutation } from 'react-apollo';
import { Edit } from '@material-ui/icons';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import { User } from 'util/model';
import { FileModelType, UserModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { useGetFieldError } from 'util/useGetFieldError';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const ProfileData = memo(() => {

    const currentUser = useCurrentUser()[0] as UserModel;

    // TODO: TS 3.7 currentUser?.class ?? ''
    const [classOrShortName, setClassOrShortName] = useState((currentUser.class) || '');
    const [email, setEmail] = useState(currentUser.email);
    const [name, setName] = useState(currentUser.name);
    const [nickname, setNickname] = useState(currentUser.nickname);
    const [isHideFullName, setIsHideFullName] = useState(currentUser.hideFullName);
    const [avatarImageFile, setAvatarImageFile] = useState(currentUser.avatarImageFile);

    const [updateProfile, { error, loading: isLoading }] = useMutation<{ user: UserModel }>(UpdateProfileMutation);
    const getFieldError = useGetFieldError(error);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Daten</Typography>
                <ErrorMessage error={error} />
                <Grid container>
                    <Grid item md={4} style={{ marginTop: '1em' }}>
                        <Avatar src={avatarImageFile ? avatarImageFile.remoteLocation : User.getDefaultAvatarUrl(currentUser!)} alt={User.getNickname(currentUser!)} />
                        <SelectFileButton
                            buttonComponent={Fab}
                            buttonComponentProps={{ color: 'secondary', size: 'small', disabled: isLoading }}
                            fileFilter={f => f.fileType === FileModelType.Image}
                            label={<Edit />}
                            onSelectFile={setAvatarImageFile}
                        />
                    </Grid>
                    <Grid item md={8}>
                        <TextField
                            autoFocus
                            fullWidth
                            margin="dense"
                            id="name"
                            label="Dein Vor- und Nachname"
                            placeholder="Minnie Musterchen"
                            onChange={e => setName(e.target.value)}
                            inputProps={{ maxLength: 100 }}
                            disabled={isLoading}
                            error={!!getFieldError('name')}
                            helperText={getFieldError('name')}
                            value={name}
                            type="name"
                        />
                        <TextField
                            autoFocus
                            fullWidth
                            margin="dense"
                            id="nickname"
                            label="Dein Spitzname"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            placeholder="El Professore"
                            type="text"
                            error={!!getFieldError('nickname')}
                            helperText={getFieldError('nickname')}
                            disabled={isLoading}
                            inputProps={{ maxLength: 25 }}
                        />

                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={isHideFullName!} onChange={(e, checked) => setIsHideFullName(checked)} />}
                                label={'Deinen vollständen Namen öffentlich verstecken'}
                            />
                        </FormGroup>
                        <Typography variant="caption" component={'div'}>
                            Verstecke deinen vollständigen Namen, damit er nur vom Administrator deiner Schule gesehen werden kann.
                            Dein Name taucht nicht in den von dir erstellten Artikeln oder in deinem Profil auf. Stattdessen wird dein Spitzname angezeigt.
                    </Typography>

                        <TextField
                            autoFocus
                            fullWidth
                            margin="dense"
                            id="email"
                            label="Deine Email-Adresse:"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="beispiel@medienportal.org"
                            type="email"
                            error={!!getFieldError('email')}
                            helperText={getFieldError('email')}
                            disabled={isLoading}
                            inputProps={{ maxLength: 100 }}
                        />
                        <TextField
                            autoFocus
                            fullWidth
                            margin="dense"
                            id="classOrShortName"
                            label="Deine Klasse / Dein Kürzel:"
                            value={classOrShortName}
                            onChange={e => setClassOrShortName(e.target.value)}
                            placeholder="7/4, 11, Wie"
                            error={!!getFieldError('class')}
                            helperText={getFieldError('class') || (
                                'Gib hier deine Klasse oder dein Kürzel ein. Damit kannst du Zugriff auf deinen Stundenplan erhalten.'
                            )}
                            type="text"
                            disabled={isLoading}
                            inputProps={{ maxLength: 25 }}
                        />
                        <Button
                            type={'submit'}
                            color="secondary"
                            variant="contained"
                            style={{ float: 'right' }}
                            disabled={isLoading}
                            onClick={() => updateProfile({
                                variables: {
                                    user: {
                                        name,
                                        nickname,
                                        class: classOrShortName,
                                        hideFullName: isHideFullName,
                                        email,
                                        avatarImageFile
                                    }
                                }
                            })}
                        >
                            Speichern
                    </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});