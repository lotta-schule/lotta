import * as React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    Grid,
    Badge,
    List,
    ListItemText,
    ListItem,
    ListSubheader,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { Clear } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { Checkbox } from 'shared/general/form/checkbox';
import { Divider } from 'shared/general/divider/Divider';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { NavigationButton } from 'shared/general/button/NavigationButton';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { UpdateEmailDialog } from 'shared/dialog/UpdateEmailDialog';
import { UpdatePasswordDialog } from 'shared/dialog/UpdatePasswordDialog';
import { File, User } from 'util/model';
import { FileModelType, UserModel, FileModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useGetFieldError } from 'util/useGetFieldError';
import { useServerData } from 'shared/ServerDataContext';
import { Header, Main } from 'layout';
import Link from 'next/link';

import UpdateProfileMutation from 'api/mutation/UpdateProfileMutation.graphql';

import styles from './ProfilePage.module.scss';

export const ProfilePage = () => {
    const { baseUrl } = useServerData();
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

    const [isShowUpdatePasswordDialog, setIsShowUpdatePasswordDialog] =
        React.useState(false);

    const [isShowUpdateEmailDialog, setIsShowUpdateEmailDialog] =
        React.useState(false);

    const [updateProfile, { error, loading: isLoading }] = useMutation<{
        user: UserModel;
    }>(UpdateProfileMutation);
    const getFieldError = useGetFieldError(error);

    return (
        <Main className={styles.root}>
            <Header bannerImageUrl={'/bannerProfil.png'}>
                <h2>Meine Daten</h2>
            </Header>

            <Card>
                <CardContent>
                    <h4>Meine Daten</h4>
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
                                                  baseUrl,
                                                  avatarImageFile
                                              )
                                            : User.getDefaultAvatarUrl(
                                                  currentUser
                                              )
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
                                <Link href={'/articlesList/delete'} passHref>
                                    <Button variant={'error'}>
                                        Benutzerkonto löschen
                                    </Button>
                                </Link>
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
                                    onChange={(e) =>
                                        setName(e.currentTarget.value)
                                    }
                                    maxLength={100}
                                    disabled={isLoading}
                                    value={name}
                                    type="name"
                                />
                            </Label>
                            <ErrorMessage
                                error={getFieldError('name') || null}
                            />
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

                            <Checkbox
                                checked={isHideFullName!}
                                label={
                                    'Deinen vollständigen Namen öffentlich verstecken'
                                }
                                onChange={(e) =>
                                    setIsHideFullName(e.currentTarget.checked)
                                }
                            />

                            <div>
                                Verstecke deinen vollständigen Namen, damit er
                                nur vom Administrator deiner Schule gesehen
                                werden kann. Dein Name taucht nicht in den von
                                dir erstellten Artikeln oder in deinem Profil
                                auf. Stattdessen wird dein Spitzname angezeigt.
                            </div>

                            <Label label="Deine Klasse / Dein Kürzel:">
                                <Input
                                    autoFocus
                                    id="classOrShortName"
                                    value={classOrShortName}
                                    onChange={(e) =>
                                        setClassOrShortName(
                                            e.currentTarget.value
                                        )
                                    }
                                    placeholder="7/4"
                                    disabled={isLoading}
                                    maxLength={25}
                                />
                            </Label>
                            <ErrorMessage
                                error={getFieldError('class') || null}
                            />
                            <p>
                                <small>
                                    Gib hier deine Klasse oder dein Kürzel ein.
                                    Damit kannst du Zugriff auf deinen
                                    Stundenplan erhalten.
                                </small>
                            </p>

                            <Divider className={styles.divider} />

                            <h5>Meine Einschreibeschlüssel</h5>
                            <EnrollmentTokensEditor
                                disabled={isLoading}
                                tokens={enrollmentTokens}
                                setTokens={setEnrollmentTokens}
                            />
                            <p>
                                <small>
                                    Nutze Einschreibeschlüssel, um dich selbst
                                    in Gruppen einzutragen.
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
        </Main>
    );
};
