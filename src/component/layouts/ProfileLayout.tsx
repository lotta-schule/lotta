import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import { ArticleModel, FileModelType, UserModel } from 'model';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { Card, CardContent, Typography, TextField, Button, Fab, Avatar } from '@material-ui/core';
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

export const ProfileLayout: FunctionComponent = memo(() => {
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    const [email, setEmail] = useState(currentUser && currentUser.email);
    const [name, setName] = useState(currentUser && User.getNickname(currentUser));
    const [nickname, setNickname] = useState(currentUser && currentUser.nickname);
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
                                    margin="dense"
                                    id="name"
                                    label="Dein Vor- und Nachname"
                                    placeholder="Minnie Musterchen"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    type="name"
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                    fullWidth
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
                <Card>
                    <CardContent>
                        <Typography variant={'h4'}>Freizugebene Beiträge Beiträge</Typography>
                        {unpublishedArticlesData && unpublishedArticlesData.articles && (
                            <ArticlesManagement articles={unpublishedArticlesData.articles} />
                        )}
                    </CardContent>
                </Card>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar />
        </>
    );
});