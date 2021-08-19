import * as React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Grid,
    Typography,
    Badge,
    Divider,
    makeStyles,
    List,
    ListItemText,
    ListItem,
    ListSubheader,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { useMutation } from '@apollo/client';
import { Clear } from '@material-ui/icons';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import { UpdateEmailDialog } from 'component/dialog/UpdateEmailDialog';
import { File, User } from 'util/model';
import { FileModelType, UserModel, FileModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { useGetFieldError } from 'util/useGetFieldError';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { UpdatePasswordDialog } from 'component/dialog/UpdatePasswordDialog';
import { EnrollmentTokensEditor } from '../EnrollmentTokensEditor';
import { useHistory } from 'react-router-dom';
import { NavigationButton } from 'component/general/button/NavigationButton';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';

export const useStyles = makeStyles((theme) => ({
    gridContainer: {
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column-reverse',
        },
        '& > div': {
            padding: theme.spacing(1),
            position: 'relative',
        },
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: '80%',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    groupList: {
        marginBottom: 60,
    },
    groupListItem: {
        paddingTop: 0,
    },
    dangerSection: {
        width: '100%',
        position: 'absolute',
        bottom: theme.spacing(1),
        left: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            position: 'relative',
            bottom: 'initial',
            left: 'initial',
            marginBottom: theme.spacing(2),
        },
    },
}));

export const ProfileData = React.memo(() => {
    const styles = useStyles();
    const { push } = useHistory();

    const currentUser = useCurrentUser()!;

    const [classOrShortName, setClassOrShortName] = React.useState(
        currentUser.class
    );
    const [name, setName] = React.useState(currentUser.name);
    const [nickname, setNickname] = React.useState(currentUser.nickname);
    const [isHideFullName, setIsHideFullName] = React.useState(
        currentUser.hideFullName
    );
    const [avatarImageFile, setAvatarImageFile] = React.useState<
        FileModel | null | undefined
    >(currentUser.avatarImageFile);
    const [enrollmentTokens, setEnrollmentTokens] = React.useState<string[]>(
        currentUser.enrollmentTokens ?? []
    );

    const [
        isShowUpdatePasswordDialog,
        setIsShowUpdatePasswordDialog,
    ] = React.useState(false);

    const [
        isShowUpdateEmailDialog,
        setIsShowUpdateEmailDialog,
    ] = React.useState(false);

    const [updateProfile, { error, loading: isLoading }] = useMutation<{
        user: UserModel;
    }>(UpdateProfileMutation);
    const getFieldError = useGetFieldError(error);

    return (
        <Card>
            <CardContent>
                <Typography variant={'h4'}>Meine Daten</Typography>
                <ErrorMessage error={error} />
                <Grid container className={styles.gridContainer}>
                    <Grid item xs md={4}>
                        <Badge
                            overlap={'circle'}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            badgeContent={
                                <NavigationButton
                                    onClick={() => setAvatarImageFile(null)}
                                    icon={<Clear />}
                                />
                            }
                        >
                            <Avatar
                                src={
                                    avatarImageFile
                                        ? File.getFileRemoteLocation(
                                              avatarImageFile
                                          )
                                        : User.getDefaultAvatarUrl(currentUser)
                                }
                                alt={User.getNickname(currentUser)}
                            />
                        </Badge>
                        <br />
                        <SelectFileButton
                            buttonComponentProps={{
                                color: 'secondary',
                                size: 'small',
                                disabled: isLoading,
                            }}
                            fileFilter={(f) =>
                                f.fileType === FileModelType.Image
                            }
                            label={'Profilbild ändern'}
                            onSelect={(file: FileModel) =>
                                setAvatarImageFile(file)
                            }
                        />
                        <Divider className={styles.divider} />
                        <List
                            className={styles.groupList}
                            dense
                            subheader={
                                <ListSubheader>Meine Gruppen</ListSubheader>
                            }
                            data-testid="ProfileData-GroupsList"
                        >
                            {[...currentUser.groups]
                                .sort((g1, g2) => g2.sortKey - g1.sortKey)
                                .map((group) => (
                                    <ListItem key={group.id}>
                                        <ListItemText>
                                            {group.name}
                                        </ListItemText>
                                    </ListItem>
                                ))}
                        </List>
                        <section className={styles.dangerSection}>
                            <Divider className={styles.divider} />
                            <Button
                                variant={'error'}
                                onClick={() => push('/profile/delete')}
                            >
                                Benutzerkonto löschen
                            </Button>
                        </section>
                    </Grid>
                    <Grid item md={8}>
                        <Label label="Deine Email-Adresse:">
                            <Input
                                autoFocus
                                disabled
                                id="email"
                                value={currentUser.email}
                                placeholder="beispiel@medienportal.org"
                                type="email"
                                maxLength={100}
                            />
                        </Label>
                        <Grid container>
                            <Grid item sm={6}>
                                <Button
                                    style={{ border: 0 }}
                                    onClick={() =>
                                        setIsShowUpdateEmailDialog(true)
                                    }
                                >
                                    Email ändern
                                </Button>
                            </Grid>
                            <Grid item sm={6}>
                                <Button
                                    onClick={() =>
                                        setIsShowUpdatePasswordDialog(true)
                                    }
                                    style={{ float: 'right', border: 0 }}
                                >
                                    Passwort ändern
                                </Button>
                            </Grid>
                        </Grid>
                        <Label label="Dein Vor- und Nachname">
                            <Input
                                autoFocus
                                id="name"
                                placeholder="Minnie Musterchen"
                                onChange={(e) => setName(e.currentTarget.value)}
                                maxLength={100}
                                disabled={isLoading}
                                value={name}
                                type="name"
                            />
                        </Label>
                        <ErrorMessage error={getFieldError('name') || null} />
                        <Label label="Dein Spitzname">
                            <Input
                                autoFocus
                                id="nickname"
                                value={nickname}
                                onChange={(e) =>
                                    setNickname(e.currentTarget.value)
                                }
                                placeholder="El Professore"
                                type="text"
                                disabled={isLoading}
                                maxLength={25}
                            />
                            <ErrorMessage
                                error={getFieldError('nickname') || null}
                            />
                        </Label>

                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isHideFullName!}
                                        onChange={(_e, checked) =>
                                            setIsHideFullName(checked)
                                        }
                                    />
                                }
                                label={
                                    'Deinen vollständigen Namen öffentlich verstecken'
                                }
                            />
                        </FormGroup>
                        <Typography variant="caption" component={'div'}>
                            Verstecke deinen vollständigen Namen, damit er nur
                            vom Administrator deiner Schule gesehen werden kann.
                            Dein Name taucht nicht in den von dir erstellten
                            Artikeln oder in deinem Profil auf. Stattdessen wird
                            dein Spitzname angezeigt.
                        </Typography>
                        <Label label="Deine Klasse / Dein Kürzel:">
                            <Input
                                autoFocus
                                id="classOrShortName"
                                value={classOrShortName}
                                onChange={(e) =>
                                    setClassOrShortName(e.currentTarget.value)
                                }
                                placeholder="7/4"
                                disabled={isLoading}
                                maxLength={25}
                            />
                        </Label>
                        <ErrorMessage error={getFieldError('class') || null} />
                        <p>
                            <small>
                                Gib hier deine Klasse oder dein Kürzel ein.
                                Damit kannst du Zugriff auf deinen Stundenplan
                                erhalten.
                            </small>
                        </p>
                        <Divider className={styles.divider} />
                        <Typography variant={'h5'}>
                            Meine Einschreibeschlüssel
                        </Typography>
                        <EnrollmentTokensEditor
                            disabled={isLoading}
                            tokens={enrollmentTokens}
                            setTokens={setEnrollmentTokens}
                        />
                        <p>
                            <small>
                                Nutze Einschreibeschlüssel, um dich selbst in
                                Gruppen einzutragen.
                            </small>
                        </p>
                        <Button
                            type={'submit'}
                            style={{ float: 'right' }}
                            disabled={isLoading}
                            onClick={() =>
                                updateProfile({
                                    variables: {
                                        user: {
                                            name,
                                            nickname,
                                            class: classOrShortName,
                                            hideFullName: isHideFullName,
                                            avatarImageFile: avatarImageFile
                                                ? { id: avatarImageFile.id }
                                                : null,
                                            enrollmentTokens,
                                        },
                                    },
                                })
                            }
                        >
                            Speichern
                        </Button>
                        <UpdatePasswordDialog
                            isOpen={isShowUpdatePasswordDialog}
                            onRequestClose={() =>
                                setIsShowUpdatePasswordDialog(false)
                            }
                        />
                        <UpdateEmailDialog
                            isOpen={isShowUpdateEmailDialog}
                            onRequestClose={() =>
                                setIsShowUpdateEmailDialog(false)
                            }
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});
