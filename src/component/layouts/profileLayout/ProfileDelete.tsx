import React, { memo, lazy, useState, useMemo, Suspense } from 'react';
import {
    Button, Card, CardContent, CardActions, Collapse, DialogActions, DialogTitle, DialogContent, DialogContentText,
    Grow, LinearProgress, Tabs, Tab, Typography, fade, makeStyles,
} from '@material-ui/core';
import { ArticleModel, FileModel } from 'model';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useQuery, useMutation } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { GetRelevantFilesInUsageQuery } from 'api/query/GetRelevantFilesInUsage';
import { useSystem } from 'util/client/useSystem';
import { useOnLogout } from 'util/user/useOnLogout';
import { Article } from 'util/model';
import { ArticlesList } from 'component/profile/ArticlesList';
import { ProfileDeleteFileSelection } from './ProfileDeleteFileSelection';
import { DestroyAccountMutation } from 'api/mutation/DestroyAccountMutation';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import { NavigateNext, NavigateBefore, Warning, DeleteForever } from '@material-ui/icons';
const FileExplorer = lazy(() => import('component/fileExplorer/FileExplorer'));

enum ProfileDeleteStep {
    Start,
    ReviewArticles,
    ReviewFiles,
    ConfirmDeletion
}

export const useStyles = makeStyles(theme => ({
    paragraph: {
        maxWidth: '60em',
        margin: theme.spacing(3, 0),
        textAlign: 'justify'
    },
    cardActions: {
        justifyContent: 'space-between'
    },
    list: {
        listStyle: 'initial',
        paddingLeft: '2em'
    },
    deleteButton: {
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: fade(theme.palette.error.main, .08)
        }
    }
}))

export const ProfileDelete = memo(() => {
    const styles = useStyles();

    const history = useHistory();
    const onLogout = useOnLogout();

    const system = useSystem();
    const [selectedFilesToTransfer, setSelectedFilesToTransfer] = useState<FileModel[]>([]);

    const [currentStep, setCurrentStep] = useState<ProfileDeleteStep>(ProfileDeleteStep.Start);
    const [selectedFilesTab, setSelectedFilesTab] = useState(0);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const { data: ownArticlesData, loading: isLoadingOwnArticles, error: ownArticlesError } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewArticles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data) {
                if (!data.articles.length) {
                    // user has not written any articles. So don't bother him, go to next step
                    setCurrentStep(s => s + 1);
                }
            }
        },
        onError: () => setCurrentStep(s => s - 1)
    });

    const { data: relevantFilesData, loading: isLoadingRelevantFiles, error: relevantFilesError } = useQuery<{ files: FileModel[] }>(GetRelevantFilesInUsageQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewFiles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data) {
                if (!data.files.length) {
                    // user has no files used in public articles or categories. Just show him his own files
                    setSelectedFilesTab(1);
                } else {
                    setSelectedFilesToTransfer([...data.files]);
                }
            }
        },
        onError: () => setCurrentStep(s => s - 1)
    });

    const [destroyAccount, { loading: isLoadingDestroyAccount, error: destroyAccountError }] = useMutation(DestroyAccountMutation, {
        variables: { transferFileIds: selectedFilesToTransfer.map(f => f.id) },
        onCompleted: () => {
            setIsConfirmDialogOpen(false);
            onLogout({ update: () => { history.push('/'); } });
        },
        onError: () => setCurrentStep(s => s - 1)
    });

    const isLoading = isLoadingOwnArticles || isLoadingRelevantFiles || isLoadingDestroyAccount;

    const cardActions = useMemo(() => {
        const button =
            currentStep < ProfileDeleteStep.ConfirmDeletion ? (
                <Button
                    size={'small'}
                    variant={'outlined'}
                    color={'secondary'}
                    disabled={isLoading}
                    endIcon={<NavigateNext />}
                    onClick={() => {
                        setCurrentStep(s => s + 1);
                    }}
                >
                    Weiter
                </Button>
            ) : (
                <Button
                    size={'small'}
                    variant={'outlined'}
                    className={styles.deleteButton}
                    disabled={isLoading}
                    startIcon={<Warning />}
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
                        size={'small'}
                        color={'secondary'}
                        variant={'outlined'}
                        startIcon={<NavigateBefore />}
                        disabled={currentStep <= ProfileDeleteStep.Start} onClick={() => setCurrentStep(s => s - 1)} aria-hidden={isLoading || currentStep <= ProfileDeleteStep.Start}>
                        Zurück
                    </Button>
                </Grow>
                <Grow in={!isLoading}>
                    {button}
                </Grow>
            </CardActions>
        );
    }, [currentStep, styles, isLoading]);

    return (
        <>
            {isLoading && (
                <Card data-testid={'ProfileDeleteLoadingCard'}>
                    <CardContent>
                        <LinearProgress variant={'indeterminate'} />
                    </CardContent>
                </Card>
            )}

            <ErrorMessage error={ownArticlesError || relevantFilesError} />

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.Start}>
                <Card aria-hidden={isLoading || currentStep !== ProfileDeleteStep.Start} data-testid={'ProfileDeleteStep1Card'}>
                    <CardContent>
                        <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Benutzerkonto und Daten löschen</Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Deine Zeit bei <em>{system.title}</em> ist vorbei und du möchtest dein Benutzerkonto mit deinen persönlichen Dateien und Daten löschen?<br />
                            Deine Zeit bei <em>{system.title}</em> ist vorbei und du möchtest dein Benutzerkonto mit deinen persönlichen Dateien und Daten löschen?
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            <p>Es ist wichtig zu wissen, wo persönliche Daten von dir und über dich gespeichert sind.</p>
                            <p>Hier erhältst du eine Übersicht darüber,</p>
                        </Typography>
                        <Typography className={clsx(styles.paragraph, styles.list)} variant={'body1'} component={'ul'}>
                            <li>welche Daten Lotta über dich gespeichert hat,</li>
                            <li>welche gelöscht werden können und</li>
                            <li>welche Daten Du an <em>{system.title}</em> übergeben kannst, sodass nachfolgende Generationen auf der Homepage von <em>{system.title}</em> von Dir lesen können.</li>
                         </Typography>
                    </CardContent>
                    {cardActions}
                </Card>
            </Collapse>

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.ReviewArticles}>
                <Card aria-hidden={isLoading || currentStep !== ProfileDeleteStep.ReviewArticles} data-testid={'ProfileDeleteStep2Card'}>
                   <CardContent>
                       {ownArticlesData && ownArticlesData.articles.length > 0 && (
                           <>
                               <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Deine Beiträge</Typography>
                               <Typography className={styles.paragraph} variant={'body1'}>
                                   Du bist bei <strong> {ownArticlesData.articles.filter(Article.isVisible).length} </strong> sichtbaren Beiträgen auf <em>{system.title}</em> als Autor eingetragen.
                                </ Typography>
                                <Typography className={styles.paragraph} variant={'body1'}>
                                    Wenn dein Konto gelöscht ist, bleiben die sichtbaren Artikel erhalten, nur du wirst als Autor entfernt.
                                    Überprüfe, ob das für dich in Ordnung ist. Du hast hier nochmal die Gelegenheit, Beiträge zu überprüfen.
                                    Alle nicht-sichtbaren Beiträge (z.Bsp. Beiträge die in Bearbeitung sind) werden gelöscht.
                               </Typography>
                               <ArticlesList articles={ownArticlesData.articles} />
                           </>
                       )}
                   </CardContent>
                   {cardActions}
                </Card>
            </Collapse>

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.ReviewFiles}>
                <Card aria-hidden={isLoading || currentStep !== ProfileDeleteStep.ReviewFiles} data-testid={'ProfileDeleteStep3Card'}>
                    <CardContent>
                        {relevantFilesData && relevantFilesData.files.length > 1 && (
                            <Tabs
                                value={selectedFilesTab}
                                onChange={(e, val) => setSelectedFilesTab(val)}
                                indicatorColor={'primary'}
                                textColor={'primary'}
                                variant={'fullWidth'}
                            >
                                <Tab
                                    value={0}
                                    label={`Dateien übergeben (${selectedFilesToTransfer.length}/${relevantFilesData.files.length})`}
                                />
                                <Tab value={1} label={'Alle Dateien überprüfen'} />
                            </Tabs>
                        )}

                        <div role={'tabpanel'} hidden={selectedFilesTab !== 0} aria-labelledby={'tabpanel-handover-heading'}>
                            <Typography className={styles.paragraph} variant={'h4'} component={'h3'} id={'tabpanel-handover-heading'}>
                                Dateien aus genutzten Beiträgen übergeben
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Es gibt Dateien, die du hochgeladen hast, die bei <em>{system.title}</em> in Beiträgen sichtbar sind.
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Du hast jetzt die Möglichkeit, die Nutzungsrechte an diesen Dateien <em>{system.title}</em> zu übergeben. Dadurch bleiben die Beiträge weiter vollständig und die Dateien wären weiter für Nutzer sichtbar.
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Überlege dir gut, für welche Dateien du <em>{system.title}</em> erlauben möchtest, sie weiterhin auf ihrer Webseite zu zeigen. Wenn dein Benutzerkonto erst gelöscht ist, kann der Vorgang nicht mehr korrigiert werden, und du wirst dich persönlich an einen Administrator wenden müssen.
                            </Typography>
                            <ProfileDeleteFileSelection
                                files={relevantFilesData?.files ?? []}
                                selectedFiles={selectedFilesToTransfer}
                                onSelectFiles={setSelectedFilesToTransfer}
                            />
                        </div>
                        <div role={'tabpanel'} hidden={selectedFilesTab !== 1} aria-labelledby={'tabpanel-files-heading'}>
                            <Typography className={styles.paragraph} variant={'h4'} component={'h3'} id={'tabpanel-files-heading'}>
                                Alle Dateien überprüfen
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Du kannst Dateien, die du behalten möchtest, zur Sicherheit herunterladen. Andere Dateien werden endgültig gelöscht.
                            </Typography>
                            <Suspense fallback={'...'}>
                                <FileExplorer />
                            </Suspense>
                        </div>
                    </CardContent>
                    {cardActions}
                </Card>
            </Collapse>

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.ConfirmDeletion}>
                <Card aria-hidden={isLoading || currentStep !== ProfileDeleteStep.ConfirmDeletion} data-testid={'ProfileDeleteStep4Card'}>
                    <CardContent>
                        <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>
                            Löschanfrage bestätigen
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Deine Daten können nun gelöscht werden.
                        </Typography>
                        <Typography className={clsx(styles.paragraph, styles.list)} variant={'body1'} component={'ul'}>
                            <li>Von dir erstellte, nicht veröffentlichte Beiträge, bei denen es keine anderen AutorInnen gibt, werden gelöscht</li>
                            <li>Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht sind</li>
                            <li>Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht sind</li>
                            {selectedFilesToTransfer.length > 0 && (
                                <li>
                                    Deine Dateien und Ordner, ausgenommen die <em>{selectedFilesToTransfer.length} Dateien</em>,
                                    die du {system.title} überlässt, werden gelöscht
                                </li>
                            )}
                            {selectedFilesToTransfer.length === 0 && (
                                <li>Alle deine Dateien und Ordner werden gelöscht</li>
                            )}
                            <li>Dein Nutzeraccount und alle darin gespeicherten Informationen werden gelöscht
                                [Hinweis: Es kann bis zu vier Wochen dauern, bis die allerletzten Daten, wie IP-Adressen aus Logs,
                                oder Daten die sich in Backups befinden, gelöscht werden.]
                            </li>
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Wenn du einverstanden bist, klicke auf 'Daten endgültig löschen'.
                            Du wirst dann abgemeldet und auf die Startseite weitergeleitet.
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Dieser Vorgang ist endgültig.
                        </Typography>
                    </CardContent>
                    {cardActions}
                </Card>
            </Collapse>
            <ResponsiveFullScreenDialog
                open={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                aria-labelledby={'alert-dialog-title'}
                aria-describedby={'alert-dialog-description'}
            >
                <DialogTitle id={'alert-dialog-title'}>Benutzerkonto wirklich löschen?</DialogTitle>
                <DialogContent>
                    <ErrorMessage error={destroyAccountError} />
                    <DialogContentText id={'alert-dialog-description'}>
                        Das Benutzerkonto wird endgültig und unwiederbringlich gelöscht. Daten können nicht wiederhergestellt werden.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfirmDialogOpen(false)} color={'primary'} autoFocus>
                        Abbrechen
                    </Button>
                    <Button onClick={() => destroyAccount()} variant={'outlined'} startIcon={<DeleteForever />} className={styles.deleteButton} disabled={isLoading}>
                        Jetzt alle Daten endgültig löschen
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        </>
    );
});
