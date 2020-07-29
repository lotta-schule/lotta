import React, { memo, lazy, useState, useMemo, Suspense } from 'react';
import { Button, Card, CardContent, CardActions, Collapse, Grow, LinearProgress, Tabs, Tab, Typography, makeStyles } from '@material-ui/core';
import { ArticleModel, FileModel, ID } from 'model';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useQuery } from '@apollo/client';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { GetDirectoriesAndFilesQuery as GetRelevantFilesInUsageQuery } from 'api/query/GetDirectoriesAndFiles';
import { useTenant } from 'util/client/useTenant';
import { Article } from 'util/model';
import { ArticlesList } from 'component/profile/ArticlesList';
import clsx from 'clsx';
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
    }
}))

export const ProfileDelete = memo(() => {
    const styles = useStyles();

    const tenant = useTenant();
    const [fileIdsToTransfer, ] = useState<ID[]>([]);

    const [currentStep, setCurrentStep] = useState<ProfileDeleteStep>(ProfileDeleteStep.Start);
    const [selectedFilesTab, setSelectedFilesTab] = useState(0);

    const { data: ownArticlesData, loading: isLoadingOwnArticles, error: ownArticlesError } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewArticles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: ({ articles }) => {
            if (!articles.length) {
                // user has not written any articles. So don't bother him, go to next step
                setCurrentStep(s => s + 1);
            }
        }
    });

    const { data: relevantFilesData, loading: isLoadingRelevantFiles, error: relevantFilesError } = useQuery<{ files: FileModel[] }>(GetRelevantFilesInUsageQuery, {
        skip: currentStep !== ProfileDeleteStep.ReviewFiles,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: ({ files }) => {
            if (!files.length) {
                // user has no files used in public articles or categories. Just show him his own files
                setSelectedFilesTab(1);
            }
        }
    });

    const isLoading = isLoadingOwnArticles || isLoadingRelevantFiles;

    const cardActions = useMemo(() => (
        <CardActions className={styles.cardActions}>
            <Grow in={!isLoading && currentStep > ProfileDeleteStep.Start}>
                <Button size={'small'} color={'secondary'} disabled={currentStep <= ProfileDeleteStep.Start} onClick={() => setCurrentStep(s => s - 1)}>
                    &lt; Zurück
                </Button>
            </Grow>
            <Grow in={!isLoading} style={{ transitionDelay: '1s' }}>
                <Button
                    size={'small'}
                    color={'secondary'}
                    disabled={isLoading}
                    onClick={() => {
                        setCurrentStep(s => s + 1);
                    }}
                >
                    {currentStep === ProfileDeleteStep.ConfirmDeletion ?  'Daten endültig löschen' : 'Weiter >'}
                </Button>
            </Grow>
        </CardActions>
    ), [currentStep, styles.cardActions, isLoading]);

    return (
        <>
            {isLoading && (
                <Card>
                    <CardContent>
                        <LinearProgress variant={'indeterminate'} />
                    </CardContent>
                </Card>
            )}

            <ErrorMessage error={ownArticlesError || relevantFilesError} />

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.Start}>
                <Card>
                    <CardContent>
                        <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Benutzerkonto und Daten löschen</Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Deine Zeit bei <em>{tenant.title}</em> ist vorbei und du möchtest dein Benutzerkonto mit deinen persönlichen Dateien und Daten löschen?<br />
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Es ist wichtig zu wissen, wo persönliche Daten von und über dich gespeichert sind, und es ist gut,
                            dass du dich rechtzeitig darum kümmerst, nicht mehr gebrauchte Daten wieder zu löschen.
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Hier erhältst du eine Übersicht darüber, welche Daten wir über dich haben und welche wir löschen werden.<br />
                            Du erhältst so zum Beispiel die Gelgenheit, einzelne Dateien zu sichern.
                        </Typography>
                    </CardContent>
                    {cardActions}
                </Card>
            </Collapse>

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.ReviewArticles}>
                <Card>
                   <CardContent>
                       {ownArticlesData && ownArticlesData.articles.length > 0 && (
                           <>
                               <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Deine Beiträge</Typography>
                               <Typography className={styles.paragraph} variant={'body1'}>
                                   Du bist bei {ownArticlesData.articles.filter(Article.isVisible).length} sichtbaren Beiträgen auf <em>{tenant.title}</em> als Autor eingetragen.
                               </Typography>
                               <Typography className={styles.paragraph} variant={'body1'}>
                                   Wenn dein Konto gelöscht ist bleiben die sichtbaren Artikel erhalten, nur du wirst als Autor entfernt.
                               </Typography>
                               <Typography className={styles.paragraph} variant={'body1'}>
                                   Überprüfe, ob das für dich in Ordnung ist. Du hast hier nochmal die letzte Gelegenheit, Beiträge zu überprüfen.
                                   Alle nicht-sichtbaren Beiträge werden gelöscht.
                               </Typography>
                               <ArticlesList articles={ownArticlesData.articles} />
                           </>
                       )}
                   </CardContent>
                   {cardActions}
                </Card>
            </Collapse>

            <Collapse in={!isLoading && currentStep === ProfileDeleteStep.ReviewFiles}>
                <Card>
                    <CardContent>
                        {relevantFilesData && relevantFilesData.files.length > 1 && (
                            <Tabs
                                value={selectedFilesTab}
                                onChange={(e, val) => setSelectedFilesTab(val)}
                                indicatorColor={'primary'}
                                textColor={'primary'}
                                variant={'fullWidth'}
                            >
                                <Tab value={0} label={'Dateien übergeben'} />
                                <Tab value={1} label={'Alle Dateien überprüfen'} />
                            </Tabs>
                        )}

                        <div role={'tabpanel'} hidden={selectedFilesTab !== 0}>
                            <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Dateien aus genutzten Beiträgen übergeben</Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Es gibt noch Dateien, die bei <em>{tenant.title}</em> in Beiträgen sichtbar sind, die du aber ursprünglich hochgeladen hast.
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Du hast jetzt die Möglichkeit, die Nutzungsrechte an diesen Dateien <em>{tenant.title}</em> zu übergeben.
                                Dadurch blieben die Beiträge weiter vollständig und die Dateien wären weiter für Besucher zugänglich.
                            </Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Überlege dir gut, für welche Dateien du <em>{tenant.title}</em> erlauben möchtest, sie weiterhin auf ihrer Webseite zu zeigen:
                                Wenn dein Benutzerkonto erst gelöscht ist, kann der Vorgang nicht mehr automatisiert werden, und du wirst dich persönlich an <em>{tenant.title}</em>
                                wenden müssen.
                            </Typography>
                            x<br />
                            x<br />
                            x<br />
                            x<br />
                            x<br />
                            x<br />
                            x<br />
                        </div>
                        <div role={'tabpanel'} hidden={selectedFilesTab !== 1}>
                            <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Alle Dateien überprüfen</Typography>
                            <Typography className={styles.paragraph} variant={'body1'}>
                                Hier hast du nochmal einen Überblick über alle deine Dateien.
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
                <Card>
                    <CardContent>
                        <Typography className={styles.paragraph} variant={'h4'} component={'h3'}>Benutzerkonto und Daten löschen</Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Deine Daten können nun gelöscht werden.
                        </Typography>
                        <Typography className={clsx(styles.paragraph, styles.list)} variant={'body1'} component={'ul'}>
                            <li>Von dir erstellte, nicht veröffentlichte Beiträge, bei denen es keine anderen AutorInnen gibt, werden gelöscht</li>
                            <li>Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht sind</li>
                            {fileIdsToTransfer.length > 0 && (
                                <li>Deine Dateien und Ordner, ausgenommen die ${fileIdsToTransfer} Dateien, die du ${tenant.title} überlässt, werden gelöscht</li>
                            )}
                            {fileIdsToTransfer.length === 0 && (
                                <li>Alle deine Dateien und Ordner werden gelöscht</li>
                            )}
                            <li>Dein Nutzeraccount und alle darin gespeicherten Informationen werden gelöscht</li>
                            <li>
                                Es kann bis zu vier Wochen dauern, bis die allerletzten Daten, wie IP-Adressen aus Logs,
                                oder Daten die sich in Backups befinden, gelöscht werden.
                            </li>
                        </Typography>
                        <Typography className={styles.paragraph} variant={'body1'}>
                            Wenn du einverstanden bist, klicke auf 'Daten endgültig löschen'.
                            Du wirst abgemeldet und auf die Startseite weitergeleitet.
                        </Typography>
                    </CardContent>
                    {cardActions}
                </Card>
            </Collapse>
        </>

    );
});
