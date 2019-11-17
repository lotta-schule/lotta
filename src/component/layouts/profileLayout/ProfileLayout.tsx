import React, { memo, useState, useEffect } from 'react';
import { ArticleModel, FileModelType, UserModel } from 'model';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { Card, CardContent, Typography, TextField, Button, Fab, Avatar, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { Grid } from '@material-ui/core';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks';
import { User } from 'util/model';
import useRouter from 'use-react-router';
import { WidgetsList } from '../WidgetsList';

export const ProfileLayout = memo(() => {
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    // TODO: TS 3.7 currentUser?.class ?? ''
    const [classOrShortName, setClassOrShortName] = useState((currentUser && currentUser.class) || '');
    const [email, setEmail] = useState(currentUser && currentUser.email);
    const [name, setName] = useState(currentUser && currentUser.name);
    const [nickname, setNickname] = useState(currentUser && currentUser.nickname);
    const [isHideFullName, setIsHideFullName] = useState(currentUser && currentUser.hideFullName);
    const [avatarImageFile, setAvatarImageFile] = useState(currentUser && currentUser.avatarImageFile);

    const { data: ownArticlesData } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);
    const [loadUnpublishedArticles, { data: unpublishedArticlesData }] = useLazyQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery);
    const [updateProfile, { error, loading: isLoading }] = useMutation<{ user: UserModel }>(UpdateProfileMutation);

    useEffect(() => {
        if (!currentUser) {
            history.replace('/');
        } else if (User.isAdmin(currentUser)) {
            loadUnpublishedArticles();
        }
    }, [currentUser, history, loadUnpublishedArticles]);

    if (!currentUser) {
        return (<div></div>);
    }
    return (
        <>
            <BaseLayoutMainContent>
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Meine Daten</Typography>
                        {error && (
                            <div style={{ color: 'red' }}>{error.message}</div>
                        )}
                        <Grid container>
                            <Grid item md={4} style={{ marginTop: '1em' }}>
                                <Avatar src={avatarImageFile ? avatarImageFile.remoteLocation : User.getDefaultAvatarUrl(currentUser)} alt={User.getNickname(currentUser)} />
                                <SelectFileButton
                                    buttonComponent={Fab}
                                    buttonComponentProps={{ color: 'secondary', size: 'small', disabled: isLoading }}
                                    label={<Edit />}
                                    fileFilter={f => f.fileType === FileModelType.Image}
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
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    type="name"
                                    disabled={isLoading}
                                    inputProps={{ maxLength: 100 }}
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
                                    helperText={'Gib hier deine Klasse oder dein Kürzel ein. Damit kannst du Zugriff auf deinen Stundenplan erhalten.'}
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
                {unpublishedArticlesData && unpublishedArticlesData.articles && (
                    <Card>
                        <CardContent>
                            <Typography variant={'h4'}>Freizugebene Beiträge</Typography>
                            <ArticlesManagement articles={unpublishedArticlesData.articles} />
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Meine Medien</Typography>
                        <FileExplorer />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Meine Beiträge</Typography>
                        {ownArticlesData && ownArticlesData.articles && (
                            <ArticlesManagement articles={ownArticlesData.articles} />
                        )}
                    </CardContent>
                </Card>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <WidgetsList widgets={[]} />
            </BaseLayoutSidebar>
        </>
    );
});