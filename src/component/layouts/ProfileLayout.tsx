import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import { ArticleModel } from 'model';
import { ArticlesManagement } from 'component/profile/ArticlesManagement';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { Card, CardContent, Typography, TextField, Button, Fab } from '@material-ui/core';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { Edit } from '@material-ui/icons';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { Grid } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { User } from 'util/model';
import useRouter from 'use-react-router';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';

export const ProfileLayout: FunctionComponent = memo(() => {
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    const [email, setEmail] = useState(currentUser && currentUser.email);
    const [name, setName] = useState(currentUser && User.getNickname(currentUser));
    const [nickname, setNickname] = useState(currentUser && currentUser.nickname);

    const { data: ownArticlesData } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);
    const [loadUnpublishedArticles, { data: unpublishedArticlesData }] = useLazyQuery<{ articles: ArticleModel[] }>(GetUnpublishedArticlesQuery);

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