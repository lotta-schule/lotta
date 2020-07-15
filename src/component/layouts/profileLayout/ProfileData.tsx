import React, { memo, useState } from 'react';
import {
    Avatar, Card, CardContent, Checkbox, FormGroup, FormControlLabel, Grid, TextField, Typography,
    Button, IconButton, Badge, Divider, makeStyles, List, ListItemText, ListItem, ListSubheader
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { Clear } from '@material-ui/icons';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import { User } from 'util/model';
import { FileModelType, UserModel, FileModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { useGetFieldError } from 'util/useGetFieldError';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { UpdatePasswordDialog } from 'component/dialog/UpdatePasswordDialog';
import { SaveButton } from 'component/general/SaveButton';
import { EnrollmentTokensEditor } from '../EnrollmentTokensEditor';

export const useStyles = makeStyles(theme => ({
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }
}))

export const ProfileData = memo(() => {
    const styles = useStyles();

    const currentUser = useCurrentUser()[0] as UserModel;

    const [classOrShortName, setClassOrShortName] = useState(currentUser.class);
    const [email, setEmail] = useState(currentUser.email);
    const [name, setName] = useState(currentUser.name);
    const [nickname, setNickname] = useState(currentUser.nickname);
    const [isHideFullName, setIsHideFullName] = useState(currentUser.hideFullName);
    const [avatarImageFile, setAvatarImageFile] = useState<FileModel | null | undefined>(currentUser.avatarImageFile);
    const [enrollmentTokens, setEnrollmentTokens] = useState<string[]>(currentUser.enrollmentTokens ?? []);

    const [isShowUpdatePasswordDialog, setIsShowUpdatePasswordDialog] = useState(false);

    const [isShowSuccess, setIsShowSuccess] = useState(false);
    const [updateProfile, { error, loading: isLoading }] = useMutation<{ user: UserModel }>(UpdateProfileMutation, {
        onCompleted: () => {
            setIsShowSuccess(true);
            setTimeout(() => setIsShowSuccess(false), 3000);
        }
    });
    const getFieldError = useGetFieldError(error);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Daten</Typography>
                <ErrorMessage error={error} />
                <Grid container>
                    <Grid item md={4} style={{ marginTop: '1em' }}>
                        <Badge
                            overlap={'circle'}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            badgeContent={(
                                <IconButton size={'small'} onClick={() => setAvatarImageFile(null)}>
                                    <Clear />
                                </IconButton>
                            )}
                        >
                            <Avatar
                                src={avatarImageFile ? avatarImageFile.remoteLocation : User.getDefaultAvatarUrl(currentUser)}
                                alt={User.getNickname(currentUser)}
                            />
                        </Badge>
                        <br />
                        <SelectFileButton
                            buttonComponentProps={{ color: 'secondary', size: 'small', disabled: isLoading }}
                            fileFilter={f => f.fileType === FileModelType.Image}
                            label={'Profilbild ändern'}
                            onSelect={(file: FileModel) => setAvatarImageFile(file)}
                        />
                        <Divider className={styles.divider} style={{ width: '80%' }} />
                        <List subheader={<ListSubheader>Meine Gruppen</ListSubheader>} data-testid="ProfileData-GroupsList">
                            {[...currentUser.groups].sort((g1, g2) => g2.sortKey - g1.sortKey).map(group => (
                                <ListItem key={group.id}>
                                    <ListItemText>{group.name}</ListItemText>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item md={8}>
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
                        <Button onClick={() => setIsShowUpdatePasswordDialog(true)} style={{ float: 'right' }}>
                            Passwort ändern
                        </Button>
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
                                label={'Deinen vollständigen Namen öffentlich verstecken'}
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
                        <Divider className={styles.divider} />
                        <Typography variant={'h5'}>Meine Einschreibeschlüssel</Typography>
                        <EnrollmentTokensEditor
                            disabled={isLoading}
                            tokens={enrollmentTokens}
                            setTokens={setEnrollmentTokens}
                        />
                        <Typography variant="caption" component={'div'}>
                            Nutze Einschreibeschlüssel, um dich selbst in Gruppen einzutragen.
                        </Typography>
                        <SaveButton
                            type={'submit'}
                            style={{ float: 'right' }}
                            isLoading={isLoading}
                            isSuccess={isShowSuccess}
                            onClick={() => updateProfile({
                                variables: {
                                    user: {
                                        name,
                                        nickname,
                                        class: classOrShortName,
                                        hideFullName: isHideFullName,
                                        email,
                                        avatarImageFile: avatarImageFile ? { id: avatarImageFile.id } : null,
                                        enrollmentTokens
                                    }
                                }
                            })}
                        >
                            Speichern
                        </SaveButton>
                        <UpdatePasswordDialog isOpen={isShowUpdatePasswordDialog} onRequestClose={() => setIsShowUpdatePasswordDialog(false)} />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});
