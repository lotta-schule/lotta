import React, { memo, useState } from 'react';
import { Card, CardContent, Typography, Grow, makeStyles, LinearProgress } from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { ArticleModel, UserModel } from 'model';
import { UpdateProfileMutation } from 'api/mutation/UpdateProfileMutation';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useQuery } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { useTenant } from 'util/client/useTenant';
import { ArticlesList } from 'component/profile/ArticlesList';

export const useStyles = makeStyles(theme => ({
}))

export const ProfileDelete = memo(() => {
    // const styles = useStyles();

    // const currentUser = useCurrentUser()[0] as UserModel;
    const tenant = useTenant();

    const { data: ownArticlesData, loading: isLoadingOwnArticles, error: ownArticlesError } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery);

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant={'h4'} component={'h3'}>Benutzerkonto persönliche Daten löschen</Typography>
                    <Typography variant={'body1'}>
                        Deine Zeit bei <em>{tenant.title}</em> ist vorbei und du möchtest dein Benutzerkonto mit deinen persönlichen Dateien und Daten löschen?<br />
                    </Typography>
                    <Typography variant={'body1'}>
                        Es ist wichtig zu wissen, wo persönliche Daten von und über dich gespeichert sind, und es ist gut,
                        dass du dich rechtzeitig darum kümmerst, nicht mehr gebrauchte Daten wieder zu löschen.
                    </Typography>
                </CardContent>
            </Card>

            <ErrorMessage error={ownArticlesError} />

            {isLoadingOwnArticles && (
                <Card><CardContent><LinearProgress variant={'indeterminate'} /></CardContent></Card>
            )}
            <Grow in={Boolean(ownArticlesData?.articles.length)}>
                {ownArticlesData?.articles.length ? (
                     <Card>
                        <CardContent>
                            <Typography variant={'h5'}>Deine Beiträge</Typography>
                            <Typography variant={'body1'}>
                                Du bist bei {ownArticlesData.articles.length} Beiträgen für <em>{tenant.title}</em> als Autor eingetragen.
                            </Typography>
                            <Typography variant={'body1'}>
                                Wenn dein Konto gelöscht ist bleiben die Artikel erhalten, nur du wirst als Autor entfernt.
                            </Typography>
                            <Typography variant={'body1'}>
                                Überprüfe, ob das für dich in Ordnung ist. Du hast hier nochmal die letzte Gelegenheit, Beiträge zu überprüfen.
                            </Typography>
                            <ArticlesList articles={ownArticlesData.articles} />
                        </CardContent>
                    </Card>
                ) : <div />}
            </Grow>
        </>

    );
});
