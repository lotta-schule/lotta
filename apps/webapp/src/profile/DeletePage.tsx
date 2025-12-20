'use client';
import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faTriangleExclamation,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { ArticleModel } from 'model';
import {
  Button,
  Box,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  LinearProgress,
  Tabbar,
  Tab,
} from '@lotta-schule/hubert';
import { useTenant } from 'util/tenant/useTenant';
import { ArticlesList } from 'shared/articlesList/ArticlesList';
import { Main, Sidebar } from 'layout';
import { ProfileDeleteFileSelection } from './component/ProfileDeleteFileSelection';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserBrowser } from 'shared/browser';
import { graphql, ResultOf } from 'api/graphql';
import clsx from 'clsx';

import DestroyAccountMutation from 'api/mutation/DestroyAccountMutation.graphql';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

export const GET_RELEVANT_FILES_IN_USAGE = graphql(`
  query GetRelevantFilesInUsage {
    files: relevantFilesInUsage {
      id
      insertedAt
      updatedAt
      filename
      filesize
      mimeType
      fileType
      userId
      formats {
        name
        url
        type
        availability {
          status
        }
      }
      usage {
        ... on FileCategoryUsageLocation {
          usage
          category {
            id
            title
          }
        }
        ... on FileArticleUsageLocation {
          usage
          article {
            id
            title
            previewImageFile {
              id
            }
          }
        }
      }
      parentDirectory {
        id
        name
      }
    }
  }
`);
export type RelevantFilesInUsage = NonNullable<
  ResultOf<typeof GET_RELEVANT_FILES_IN_USAGE>['files']
>;

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
  const currentUser = useCurrentUser();
  const [selectedFilesToTransfer, setSelectedFilesToTransfer] = React.useState<
    NonNullable<ResultOf<typeof GET_RELEVANT_FILES_IN_USAGE>['files']>
  >([]);

  const [currentStep, setCurrentStep] = React.useState<ProfileDeleteStep>(
    ProfileDeleteStep.Start
  );
  const [selectedFilesTab, setSelectedFilesTab] = React.useState(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);

  const {
    data: ownArticlesData,
    previousData: ownArticlesPreviousData,
    loading: isLoadingOwnArticles,
    error: ownArticlesError,
  } = useQuery<{ articles: ArticleModel[] }>(GetOwnArticlesQuery, {
    skip: currentStep !== ProfileDeleteStep.ReviewArticles,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const {
    data: relevantFilesData,
    previousData: relevantFilesPreviousData,
    loading: isLoadingRelevantFiles,
    error: relevantFilesError,
  } = useQuery(GET_RELEVANT_FILES_IN_USAGE, {
    skip: currentStep !== ProfileDeleteStep.ReviewFiles,
    initialFetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  React.useEffect(() => {
    if (
      ownArticlesData !== undefined &&
      ownArticlesPreviousData === undefined &&
      ownArticlesData.articles?.length === 0
    ) {
      // userAvatar has not written any articles. So don't bother him, go to next step
      setCurrentStep((s) => s + 1);
    }
  }, [ownArticlesData, ownArticlesPreviousData]);

  React.useEffect(() => {
    if (
      ownArticlesError !== undefined &&
      ownArticlesPreviousData === undefined
    ) {
      setCurrentStep((s) => s - 1);
    }
  }, [ownArticlesError, ownArticlesPreviousData]);

  React.useEffect(() => {
    if (
      relevantFilesData !== undefined &&
      relevantFilesPreviousData === undefined &&
      relevantFilesData.files?.length === 0
    ) {
      // userAvatar has no files used in public articles or categories. Just show him his own files
      setSelectedFilesTab(1);
    }
  }, [relevantFilesData, relevantFilesPreviousData]);

  React.useEffect(() => {
    if (
      relevantFilesError !== undefined &&
      relevantFilesPreviousData === undefined
    ) {
      setCurrentStep((s) => s - 1);
    }
  }, [relevantFilesError, relevantFilesPreviousData]);

  const [
    destroyAccount,
    { loading: isLoadingDestroyAccount, error: destroyAccountError },
  ] = useMutation(DestroyAccountMutation, {
    fetchPolicy: 'no-cache',
    variables: {
      userId: currentUser?.id,
      transferFileIds: selectedFilesToTransfer.map((f) => f.id),
    },
    onCompleted: async () => {
      setIsConfirmDialogOpen(false);
      router.push('/');
      localStorage.clear();
      apolloClient.clearStore().then(() => {
        location?.reload();
      });
    },
    onError: () => setCurrentStep((s) => s - 1),
  });

  const isLoading =
    isLoadingOwnArticles || isLoadingRelevantFiles || isLoadingDestroyAccount;

  const boxActions = React.useMemo(() => {
    const button =
      currentStep < ProfileDeleteStep.ConfirmDeletion ? (
        <Button
          small
          disabled={isLoading}
          icon={<Icon icon={faAngleRight} size={'lg'} />}
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
          icon={<Icon icon={faTriangleExclamation} />}
          onClick={() => {
            setIsConfirmDialogOpen(true);
          }}
        >
          Daten endgültig löschen
        </Button>
      );
    return (
      <Box className={styles.boxActions}>
        <Collapse isOpen={!isLoading && currentStep > ProfileDeleteStep.Start}>
          <Button
            small
            icon={<Icon icon={faAngleLeft} size={'lg'} />}
            disabled={currentStep <= ProfileDeleteStep.Start}
            onClick={() => setCurrentStep((s) => s - 1)}
            aria-hidden={isLoading || currentStep <= ProfileDeleteStep.Start}
          >
            Zurück
          </Button>
        </Collapse>
        <Collapse isOpen={!isLoading}>{button}</Collapse>
      </Box>
    );
  }, [currentStep, isLoading]);

  return (
    <>
      <Main className={styles.root}>
        {isLoading && (
          <Box data-testid={'ProfileDeleteLoadingBox'}>
            <LinearProgress
              isIndeterminate
              aria-label={'Seite wird gelöscht'}
            />
          </Box>
        )}

        <ErrorMessage error={ownArticlesError || relevantFilesError} />

        <Collapse
          isOpen={!isLoading && currentStep === ProfileDeleteStep.Start}
        >
          <Box
            className={styles.container}
            aria-hidden={isLoading || currentStep !== ProfileDeleteStep.Start}
            data-testid={'ProfileDeleteStep1Box'}
          >
            <h3 className={styles.paragraph}>
              Benutzerkonto und Daten löschen
            </h3>
            <p className={styles.paragraph}>
              Deine Zeit bei <em>{tenant.title}</em> ist vorbei und du möchtest
              dein Benutzerkonto mit deinen persönlichen Dateien und Daten
              löschen?
            </p>
            <div className={styles.paragraph}>
              <p>
                Es ist wichtig zu wissen, wo persönliche Daten von dir und über
                dich gespeichert sind.
              </p>
              <p>Hier erhältst du eine Übersicht darüber,</p>
            </div>
            <ul className={clsx(styles.paragraph, styles.list)}>
              <li>welche Daten Lotta über dich gespeichert hat,</li>
              <li>welche gelöscht werden können und</li>
              <li>
                welche Daten du an <em>{tenant.title}</em> übergeben kannst,
                sodass nachfolgende Generationen auf der Homepage von{' '}
                <em>{tenant.title}</em> von dir lesen können.
              </li>
            </ul>
            {boxActions}
          </Box>
        </Collapse>

        <Collapse
          isOpen={
            !isLoading && currentStep === ProfileDeleteStep.ReviewArticles
          }
        >
          <Box
            className={styles.container}
            aria-hidden={
              isLoading || currentStep !== ProfileDeleteStep.ReviewArticles
            }
            data-testid={'ProfileDeleteStep2Box'}
          >
            {ownArticlesData && ownArticlesData.articles.length > 0 && (
              <>
                <h4 className={styles.paragraph}>Deine Beiträge</h4>
                <p className={styles.paragraph}>
                  Du bist bei{' '}
                  <strong>
                    {' '}
                    {
                      ownArticlesData.articles.filter((a) => a.published).length
                    }{' '}
                  </strong>{' '}
                  sichtbaren Beiträgen auf <em>{tenant.title}</em> als Autor
                  eingetragen.
                </p>
                <p className={styles.paragraph}>
                  Wenn dein Konto gelöscht ist, bleiben die sichtbaren Artikel
                  erhalten, nur du wirst als Autor entfernt. Überprüfe, ob das
                  für dich in Ordnung ist. Du hast hier nochmal die Gelegenheit,
                  Beiträge zu überprüfen. Alle nicht-sichtbaren Beiträge (z.Bsp.
                  Beiträge die in Bearbeitung sind) werden gelöscht.
                </p>
                <ArticlesList articles={ownArticlesData.articles} />
              </>
            )}
            {boxActions}
          </Box>
        </Collapse>

        <Collapse
          isOpen={!isLoading && currentStep === ProfileDeleteStep.ReviewFiles}
        >
          <Box
            className={styles.container}
            aria-hidden={
              isLoading || currentStep !== ProfileDeleteStep.ReviewFiles
            }
            data-testid={'ProfileDeleteStep3Box'}
          >
            {!!relevantFilesData?.files?.length && (
              <Tabbar
                value={selectedFilesTab}
                onChange={(val) => setSelectedFilesTab(val as number)}
              >
                <Tab
                  value={0}
                  label={`Dateien übergeben (${selectedFilesToTransfer.length}/${relevantFilesData.files.length})`}
                />
                <Tab value={1} label={'Alle Dateien überprüfen'} />
              </Tabbar>
            )}

            <div
              role={'tabpanel'}
              hidden={selectedFilesTab !== 0}
              aria-labelledby={'tabpanel-handover-heading'}
            >
              <h4 className={styles.paragraph} id={'tabpanel-handover-heading'}>
                Dateien aus genutzten Beiträgen übergeben
              </h4>
              <p className={styles.paragraph}>
                Es gibt Dateien, die du hochgeladen hast, die bei{' '}
                <em>{tenant.title}</em> in Beiträgen sichtbar sind.
              </p>
              <p className={styles.paragraph}>
                Du hast jetzt die Möglichkeit, die Nutzungsrechte an diesen
                Dateien <em>{tenant.title}</em> zu übergeben. Dadurch bleiben
                die Beiträge weiter vollständig und die Dateien wären weiter für
                Nutzer sichtbar.
              </p>
              <p className={styles.paragraph}>
                Überlege dir gut, für welche Dateien du <em>{tenant.title}</em>{' '}
                erlauben möchtest, sie weiterhin auf ihrer Webseite zu zeigen.
                Wenn dein Benutzerkonto erst gelöscht ist, kann der Vorgang
                nicht mehr korrigiert werden, und du wirst dich persönlich an
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
              <h4 className={styles.paragraph} id={'tabpanel-files-heading'}>
                Alle Dateien überprüfen
              </h4>
              <p className={styles.paragraph}>
                Du kannst Dateien, die du behalten möchtest, zur Sicherheit
                herunterladen. Andere Dateien werden endgültig gelöscht.
              </p>
              <UserBrowser />
            </div>
            {boxActions}
          </Box>
        </Collapse>

        <Collapse
          isOpen={
            !isLoading && currentStep === ProfileDeleteStep.ConfirmDeletion
          }
        >
          <Box
            className={styles.container}
            aria-hidden={
              isLoading || currentStep !== ProfileDeleteStep.ConfirmDeletion
            }
            data-testid={'ProfileDeleteStep4Box'}
          >
            <h4 className={styles.paragraph}>Löschanfrage bestätigen</h4>
            <p className={styles.paragraph}>
              Deine Daten können nun gelöscht werden.
            </p>
            <ul className={clsx(styles.paragraph, styles.list)}>
              <li>
                Von dir erstellte, nicht veröffentlichte Beiträge, bei denen es
                keine anderen AutorInnen gibt, werden gelöscht
              </li>
              <li>
                Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht
                sind
              </li>
              <li>
                Du wirst als AutorIn aus Beiträgen entfernt, die veröffentlicht
                sind
              </li>
              {selectedFilesToTransfer.length > 0 && (
                <li>
                  Deine Dateien und Ordner, ausgenommen die{' '}
                  <em>{selectedFilesToTransfer.length} Dateien</em>, die du{' '}
                  {tenant.title} überlässt, werden gelöscht
                </li>
              )}
              {selectedFilesToTransfer.length === 0 && (
                <li>Alle deine Dateien und Ordner werden gelöscht</li>
              )}
              <li>
                Dein Nutzeraccount und alle darin gespeicherten Informationen
                werden gelöscht [Hinweis: Es kann bis zu vier Wochen dauern, bis
                die allerletzten Daten, wie IP-Adressen aus Logs, oder Daten die
                sich in Backups befinden, gelöscht werden.]
              </li>
            </ul>
            <p className={styles.paragraph}>
              Wenn du einverstanden bist, klicke auf 'Daten endgültig löschen'.
              Du wirst dann abgemeldet und auf die Startseite weitergeleitet.
            </p>
            <p className={styles.paragraph}>Dieser Vorgang ist endgültig.</p>
            {boxActions}
          </Box>
        </Collapse>
        <Dialog
          open={isConfirmDialogOpen}
          onRequestClose={() => setIsConfirmDialogOpen(false)}
          title={'Benutzerkonto wirklich löschen?'}
        >
          <DialogContent>
            <ErrorMessage error={destroyAccountError} />
            <p>
              Das Benutzerkonto wird endgültig und unwiederbringlich gelöscht.
              Daten können nicht wiederhergestellt werden.
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsConfirmDialogOpen(false)} autoFocus>
              Abbrechen
            </Button>
            <Button
              onClick={() => destroyAccount()}
              icon={<Icon icon={faTrashCan} size={'lg'} />}
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
DeletePage.displayName = 'ProfileDeletePage';
