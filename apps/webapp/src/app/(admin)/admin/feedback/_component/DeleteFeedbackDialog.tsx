import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  LoadingButton,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client/react';
import { FeedbackModel } from 'model';

import DeleteFeedbackMutation from 'api/mutation/DeleteFeedbackMutation.graphql';

export interface DeleteFeedbackDialogProps {
  feedback: FeedbackModel;
  isOpen: boolean;
  onRequestClose(): void;
  onConfirm(): void;
}

export const DeleteFeedbackDialog = React.memo(
  ({
    feedback,
    isOpen,
    onRequestClose,
    onConfirm,
  }: DeleteFeedbackDialogProps) => {
    const [deleteFeedback, { error, loading: isLoading }] = useMutation<
      {
        feedback: { id: FeedbackModel['id'] };
      },
      { id: FeedbackModel['id'] }
    >(DeleteFeedbackMutation, {
      update: (client, { data }) => {
        if (data?.feedback) {
          const normalizedId = client.identify(data.feedback);
          if (normalizedId) {
            client.evict({ id: normalizedId });
          }
        }
      },
    });

    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Feedback löschen'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            deleteFeedback({
              variables: {
                id: feedback.id,
              },
            }).then(() => {
              onConfirm();
            });
          }}
        >
          <DialogContent>
            {error && <ErrorMessage error={error} />}
            <p>
              Möchtest du das Nutzerfeedback von{' '}
              <strong>{feedback.user?.name}</strong> wirklich löschen?
            </p>
            <p>Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onRequestClose()}>Abbrechen</Button>
            <LoadingButton
              type={'submit'}
              variant={'error'}
              state={isLoading ? 'loading' : 'idle'}
            >
              endgültig löschen
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
DeleteFeedbackDialog.displayName = 'DeleteFeedbackDialog';
