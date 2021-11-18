import * as React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Collapse,
    Grow,
    LinearProgress,
    Tabs,
    Tab,
} from '@material-ui/core';
import {
    NavigateNext,
    NavigateBefore,
    Warning,
    DeleteForever,
} from '@material-ui/icons';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
import { ArticleModel, FileModel } from 'model';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useTenant } from 'util/tenant/useTenant';
import { ArticlesList } from 'shared/articlesList/ArticlesList';
import { Main, Sidebar } from 'layout';
import { ProfileDeleteFileSelection } from './component/ProfileDeleteFileSelection';
import { useRouter } from 'next/router';
import FileExplorer from 'shared/fileExplorer/FileExplorer';
import clsx from 'clsx';

import DestroyAccountMutation from 'api/mutation/DestroyAccountMutation.graphql';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';
import GetRelevantFilesInUsageQuery from 'api/query/GetRelevantFilesInUsage.graphql';

import styles from './DeletePage.module.scss';

enum ProfileDeleteStep {
    Start,
    ReviewArticles,
    ReviewFiles,
    ConfirmDeletion,
}

export const DeletePage = React.memo(() => {
    const router = useRouter();
    const apolloClient = useApolloClient();

    const tenant = useTenant();
    const [selectedFilesToTransfer, setSelectedFilesToTransfer] =
        React.useState<FileModel[]>([]);

    const [currentStep, setCurrentStep] = React.useState<ProfileDeleteStep>(
        ProfileDeleteStep.Start
    );
    const [selectedFilesTab, setSelectedFilesTab] = React.useState(0);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);

    const {
        data: ownArticlesData,
        loading: isLoadingOwnArticles,
        error: ownArticlesError,
    } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewArticles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data) {
                if (!data.articles.length) {
                    // userAvatar has not written any articles. So don't bother him, go to next step
                    setCurrentStep((s) => s + 1);
                }
            }
        },
        onError: () => setCurrentStep((s) => s - 1),
    });

    const {
        data: relevantFilesData,
        loading: isLoadingRelevantFiles,
        error: relevantFilesError,
    } = useQuery<{ files: FileModel[] }>(GetRelevantFilesInUsageQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewFiles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data) {
                if (!data.files.length) {
                    // userAvatar has no files used in public articles or categories. Just show him his own files
                    setSelectedFilesTab(1);
                } else {
                    setSelectedFilesToTransfer([...data.files]);
                }
            }
        },
        onError: () => setCurrentStep((s) => s - 1),
    });

    const [
        destroyAccount,
        { loading: isLoadingDestroyAccount, error: destroyAccountError },
    ] = useMutation(DestroyAccountMutation, {
        fetchPolicy: 'no-cache',
        variables: {
            transferFileIds: selectedFilesToTransfer.map((f) => f.id),
        },
        onCompleted: async () => {
            setIsConfirmDialogOpen(false);
            await router.push('/');
            localStorage.clear();
            apolloClient.resetStore();
        },
        onError: () => setCurrentStep((s) => s - 1),
    });

    const isLoading =
        isLoadingOwnArticles ||
        isLoadingRelevantFiles ||
        isLoadingDestroyAccount;

    const cardActions = React.useMemo(() => {
        const button =
            currentStep < ProfileDeleteStep.ConfirmDeletion ? (
                <Button
                    small
                    disabled={isLoading}
                    icon={<NavigateNext />}
                    onClick={() => {
                        setCurrentStep((s) => s + 1);
                    }}
                >
                    Weiter
                </Button>
            ) : (
                <Button
                    small
                    className={styles.deleteButton}
                    disabled={isLoading}
                    icon={<Warning />}
                    onClick={() => {
                        setIsConfirmDialogOpen(true);
                    }}
                >
                    Daten endgültig löschen
                </Button>
            );
        return (
            <CardActions className={styles.cardActions}>
                <Grow in={!isLoading && currentStep > ProfileDeleteStep.Start}>
                    <Button
                        small
                        icon={<NavigateBefore />}
                        disabled={currentStep <= ProfileDeleteStep.Start}
                        onClick={() => setCurrentStep((s) => s - 1)}
                        aria-hidden={
                            isLoading || currentStep <= ProfileDeleteStep.Start
                        }
                    >
                        Zurück
                    </Button>
                </Grow>
                <Grow in={!isLoading}>{button}</Grow>
            </CardActions>
        );
    }, [currentStep, isLoading]);

    return (
        <>
            <Main>
                {isLoading && (
                    <Card data-testid={'ProfileDeleteLoadingCard'}>
                        <CardContent>
                            <LinearProgress variant={'indeterminate'} />
                        </CardContent>
                    </Card>
                )}

                <ErrorMessage error={ownArticlesError || relevantFilesError} />

                <Collapse
                    in={!isLoading && currentStep === ProfileDeleteStep.Start}
                >
                    <Card
                        aria-hidden={
                            isLoading || currentStep !== ProfileDeleteStep.Start
                        }
                        data-testid={'ProfileDeleteStep1Card'}
                    >
                        <CardContent>
                            <h3 className={styles.paragraph}>
                                Benutzerkonto und Daten löschen
                            </h3>
                            <p className={styles.paragraph}>
                                Deine Zeit bei <em>{tenant.title}</em> ist
                                vorbei und du möchtest dein Benutzerkonto mit
                                deinen persönlichen Dateien und Daten löschen?
                                <br />
                                Deine Zeit bei <em>{tenant.title}</em> ist
                                vorbei und du möchtest dein Benutzerkonto mit
                                deinen persönlichen Dateien und Daten löschen?
                            </p>
                            <div className={styles.paragraph}>
                                <p>
                                    Es ist wichtig zu wissen, wo persönliche
                                    Daten von dir und über dich gespeichert
                                    sind.
                                </p>
                                <p>Hier erhältst du eine Übersicht darüber,</p>
                            </div>
                            <ul className={clsx(styles.paragraph, styles.list)}>
                                <li>
                                    welche Daten Lotta über dich gespeichert
                                    hat,
                                </li>
                                <li>welche gelöscht werden können und</li>
                                <li>
                                    welche Daten Du an <em>{tenant.title}</em>{' '}
                                    übergeben kannst, sodass nachfolgende
                                    Generationen auf der Homepage von{' '}
                                    <em>{tenant.title}</em> von Dir lesen
                                    können.
                                </li>
                            </ul>
                        </CardContent>
                        {cardActions}
                    </Card>
                </Collapse>

                <Collapse
                    in={
                        !isLoading &&
                        currentStep === ProfileDeleteStep.ReviewArticles
                    }
                >
                    <Card
                        aria-hidden={
                            isLoading ||
                            currentStep !== ProfileDeleteStep.ReviewArticles
                        }
                        data-testid={'ProfileDeleteStep2Card'}
                    >
                        <CardContent>
                            {ownArticlesData &&
                                ownArticlesData.articles.length > 0 && (
                                    <>
                                        <h4 className={styles.paragraph}>
                                            Deine Beiträge
                                        </h4>
                                        <p className={styles.paragraph}>
                                            Du bist bei{' '}
                                            <strong>
                                                {' '}
                                                {
                                                    ownArticlesData.articles.filter(
                                                        (a) => a.published
                                                    ).length
                                                }{' '}
                                            </strong>{' '}
                                            sichtbaren Beiträgen auf{' '}
                                            <em>{tenant.title}</em> als Autor
                                            eingetragen.
                                        </p>
                                        <p className={styles.paragraph}>
                                            Wenn dein Konto gelöscht ist,
                                            bleiben die sichtbaren Artikel
                                            erhalten, nur du wirst als Autor
                                            entfernt. Überprüfe, ob das für dich
                                            in Ordnung ist. Du hast hier nochmal
                                            die Gelegenheit, Beiträge zu
                                            überprüfen. Alle nicht-sichtbaren
                                            Beiträge (z.Bsp. Beiträge die in
                                            Bearbeitung sind) werden gelöscht.
                                        </p>
                                        <ArticlesList
                                            articles={ownArticlesData.articles}
                                        />
                                    </>
                                )}
                        </CardContent>
                        {cardActions}
                    </Card>
                </Collapse>

                <Collapse
                    in={
                        !isLoading &&
                        currentStep === ProfileDeleteStep.ReviewFiles
                    }
                >
                    <Card
                        aria-hidden={
                            isLoading ||
                            currentStep !== ProfileDeleteStep.ReviewFiles
                        }
                        data-testid={'ProfileDeleteStep3Card'}
                    >
                        <CardContent>
                            {relevantFilesData &&
                                relevantFilesData.files.length > 1 && (
                                    <Tabs
                                        value={selectedFilesTab}
                                        onChange={(_, val) =>
                                            setSelectedFilesTab(val)
                                        }
                                        indicatorColor={'primary'}
                                        textColor={'primary'}
                                        variant={'fullWidth'}
                                    >
                                        <Tab
                                            value={0}
                                            label={`Dateien übergeben (${selectedFilesToTransfer.length}/${relevantFilesData.files.length})`}
                                        />
                                        <Tab
                                            value={1}
                                            label={'Alle Dateien überprüfen'}
                                        />
                                    </Tabs>
                                )}

                            <div
                                role={'tabpanel'}
                                hidden={selectedFilesTab !== 0}
                                aria-labelledby={'tabpanel-handover-heading'}
                            >
                                <h4
                                    className={styles.paragraph}
                                    id={'tabpanel-handover-heading'}
                                >
                                    Dateien aus genutzten Beiträgen übergeben
                                </h4>
                                <p className={styles.paragraph}>
                                    Es gibt Dateien, die du hochgeladen hast,
                                    die bei <em>{tenant.title}</em> in Beiträgen
                                    sichtbar sind.
                                </p>
                                <p className={styles.paragraph}>
                                    Du hast jetzt die Möglichkeit, die
                                    Nutzungsrechte an diesen Dateien{' '}
                                    <em>{tenant.title}</em> zu übergeben.
                                    Dadurch bleiben die Beiträge weiter
                                    vollständig und die Dateien wären weiter für
                                    Nutzer sichtbar.
                                </p>
                                <p className={styles.paragraph}>
                                    Überlege dir gut, für welche Dateien du{' '}
                                    <em>{tenant.title}</em> erlauben möchtest,
                                    sie weiterhin auf ihrer Webseite zu zeigen.
                                    Wenn dein Benutzerkonto erst gelöscht ist,
                                    kann der Vorgang nicht mehr korrigiert
                                    werden, und du wirst dich persönlich an
                                    einen Administrator wenden müssen.
                                </p>
                                <ProfileDeleteFileSelection
                                    files={relevantFilesData?.files ?? []}
                                    selectedFiles={selectedFilesToTransfer}
                                    onSelectFiles={setSelectedFilesToTransfer}
                                />
                            </div>
                            <div
                                role={'tabpanel'}
                                hidden={selectedFilesTab !== 1}
                                aria-labelledby={'tabpanel-files-heading'}
                            >
                                <h4
                                    className={styles.paragraph}
                                    id={'tabpanel-files-heading'}
                                >
                                    Alle Dateien überprüfen
                                </h4>
                                <p className={styles.paragraph}>
                                    Du kannst Dateien, die du behalten möchtest,
                                    zur Sicherheit herunterladen. Andere Dateien
                                    werden endgültig gelöscht.
                                </p>
                                <FileExplorer />
                            </div>
                        </CardContent>
                        {cardActions}
                    </Card>
                </Collapse>

                <Collapse
                    in={
                        !isLoading &&
                        currentStep === ProfileDeleteStep.ConfirmDeletion
                    }
                >
                    <Card
                        aria-hidden={
                            isLoading ||
                            currentStep !== ProfileDeleteStep.ConfirmDeletion
                        }
                        data-testid={'ProfileDeleteStep4Card'}
                    >
                        <CardContent>
                            <h4 className={styles.paragraph}>
                                Löschanfrage bestätigen
                            </h4>
                            <p className={styles.paragraph}>
                                Deine Daten können nun gelöscht werden.
                            </p>
                            <ul className={clsx(styles.paragraph, styles.list)}>
                                <li>
                                    Von dir erstellte, nicht veröffentlichte
                                    Beiträge, bei denen es keine anderen
                                    AutorInnen gibt, werden gelöscht
                                </li>
                                <li>
                                    Du wirst als AutorIn aus Beiträgen entfernt,
                                    die veröffentlicht sind
                                </li>
                                <li>
                                    Du wirst als AutorIn aus Beiträgen entfernt,
                                    die veröffentlicht sind
                                </li>
                                {selectedFilesToTransfer.length > 0 && (
                                    <li>
                                        Deine Dateien und Ordner, ausgenommen
                                        die{' '}
                                        <em>
                                            {selectedFilesToTransfer.length}{' '}
                                            Dateien
                                        </em>
                                        , die du {tenant.title} überlässt,
                                        werden gelöscht
                                    </li>
                                )}
                                {selectedFilesToTransfer.length === 0 && (
                                    <li>
                                        Alle deine Dateien und Ordner werden
                                        gelöscht
                                    </li>
                                )}
                                <li>
                                    Dein Nutzeraccount und alle darin
                                    gespeicherten Informationen werden gelöscht
                                    [Hinweis: Es kann bis zu vier Wochen dauern,
                                    bis die allerletzten Daten, wie IP-Adressen
                                    aus Logs, oder Daten die sich in Backups
                                    befinden, gelöscht werden.]
                                </li>
                            </ul>
                            <p className={styles.paragraph}>
                                Wenn du einverstanden bist, klicke auf 'Daten
                                endgültig löschen'. Du wirst dann abgemeldet und
                                auf die Startseite weitergeleitet.
                            </p>
                            <p className={styles.paragraph}>
                                Dieser Vorgang ist endgültig.
                            </p>
                        </CardContent>
                        {cardActions}
                    </Card>
                </Collapse>
                <Dialog
                    open={isConfirmDialogOpen}
                    onRequestClose={() => setIsConfirmDialogOpen(false)}
                    title={'Benutzerkonto wirklich löschen?'}
                >
                    <DialogContent>
                        <ErrorMessage error={destroyAccountError} />
                        <p>
                            Das Benutzerkonto wird endgültig und
                            unwiederbringlich gelöscht. Daten können nicht
                            wiederhergestellt werden.
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setIsConfirmDialogOpen(false)}
                            autoFocus
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={() => destroyAccount()}
                            icon={<DeleteForever />}
                            className={styles.deleteButton}
                            disabled={isLoading}
                        >
                            Jetzt alle Daten endgültig löschen
                        </Button>
                    </DialogActions>
                </Dialog>
            </Main>
            <Sidebar isEmpty />
        </>
    );
});
