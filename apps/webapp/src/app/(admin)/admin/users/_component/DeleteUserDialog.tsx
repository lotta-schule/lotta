import * as React from 'react';
import { ArticleModel, UserModel } from 'model';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  ErrorMessage,
} from '@lotta-schule/hubert';
import { useMutation, useQuery } from '@apollo/client/react';
import { Article } from 'util/model';
import Link from 'next/link';

import GetArticlesWithUserFiles from 'api/query/GetArticlesWithUserFiles.graphql';
import DestroyAccountMutation from 'api/mutation/DestroyAccountMutation.graphql';

enum DeleteUserDialogSteps {
  Start,
  Review,
  Confirm,
}

export interface DeleteUserDialogProps {
  user: UserModel;
  onConfirm?: () => void;
  onRequestClose?: () => void;
}
export const DeleteUserDialog = React.memo<DeleteUserDialogProps>(
  ({ user, onRequestClose, onConfirm }) => {
    const [step, setStep] = React.useState(DeleteUserDialogSteps.Start);
    const {
      data: articlesWithUse,
      loading: articlesWithUseIsLoading,
      error: articlesWithUseError,
    } = useQuery<{ articles: ArticleModel[] }>(GetArticlesWithUserFiles, {
      skip: step !== DeleteUserDialogSteps.Review,
      variables: { userId: user.id },
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
    });

    const [destroyAccount] = useMutation(DestroyAccountMutation, {
      variables: { userId: user.id, transferFileIds: [] },
      onCompleted: () => onConfirm?.(),
    });

    return (
      <Dialog
        open={true}
        title={`${user.name} löschen`}
        onRequestClose={onRequestClose}
      >
        <DialogContent>
          {step === DeleteUserDialogSteps.Start && (
            <>
              <p>
                Achtung: Das Löschen eines Nutzers kann{' '}
                <strong>nicht rückgängig gemacht werden</strong>.
              </p>
              <p>
                Der Nutzer wird nach erfolgreicher Löschung via Email
                informiert.
              </p>
              <p>Alle Dateien, die dem Nutzer gehören, werden gelöscht.</p>
            </>
          )}
          {step === DeleteUserDialogSteps.Review && (
            <>
              <ErrorMessage error={articlesWithUseError} />
              {articlesWithUseIsLoading && (
                <CircularProgress
                  label={'Beiträge mit Dateien des Nutzers werden ermittelt.'}
                />
              )}
              {articlesWithUse?.articles.length === 0 && (
                <p>
                  Es konnten <strong>keine Dateien</strong> von {user.name} in
                  öffentlichen Beiträgen gefunden werden.
                </p>
              )}
              {Boolean(articlesWithUse?.articles.length) && (
                <>
                  <p>
                    Es konnten{' '}
                    <strong>{articlesWithUse!.articles.length}</strong>
                    Beiträge gefunden werden, die Dateien von {user.name}{' '}
                    enthalten.
                  </p>
                  <p>Folgende Beiträge enthalten Dateien des Nutzers:</p>
                  <ul>
                    {articlesWithUse!.articles.map((article) => (
                      <li key={article.id}>
                        <Link href={Article.getPath(article)} target={'_blank'}>
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
          {step === DeleteUserDialogSteps.Confirm && (
            <>
              <p>Der Nutzer wird im nächsten Schritt endgültig gelöscht.</p>
              <p>Dieser Schritt kann nicht rückgängig gemacht werden.</p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {step === DeleteUserDialogSteps.Start && (
            <Button onClick={onRequestClose}>abbrechen</Button>
          )}
          {step > 0 && (
            <Button onClick={() => setStep((step) => step - 1)}>zurück</Button>
          )}
          {step < DeleteUserDialogSteps.Confirm && (
            <Button onClick={() => setStep((step) => step + 1)}>weiter</Button>
          )}
          {step === DeleteUserDialogSteps.Confirm && (
            <Button variant={'error'} onClick={() => destroyAccount()}>
              endgültig löschen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);
DeleteUserDialog.displayName = 'DeleteUserDialog';
