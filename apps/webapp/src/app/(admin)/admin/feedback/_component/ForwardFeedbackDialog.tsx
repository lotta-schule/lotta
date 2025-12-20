import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client/react';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FeedbackModel } from 'model';
import { Icon } from 'shared/Icon';

import SendFeedbackToLottaMutation from 'api/mutation/SendFeedbackToLottaMutation.graphql';

export interface ForwardFeedbackDialogProps {
  isOpen: boolean;
  feedback: FeedbackModel;
  onRequestClose(): void;
}

export const ForwardFeedbackDialog = React.memo(
  ({ feedback, isOpen, onRequestClose }: ForwardFeedbackDialogProps) => {
    const [forwardFeedback, { error, loading: isLoading }] = useMutation<{
      feedback: FeedbackModel;
    }>(SendFeedbackToLottaMutation);

    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Feedback weiterleiten'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            forwardFeedback({
              variables: {
                id: feedback.id,
                message: formData.get('message') || undefined,
              },
            }).then(() => {
              onRequestClose();
            });
          }}
        >
          <DialogContent>
            {error && <ErrorMessage error={error} />}
            <p>
              Leite die E-Mail mit dem Feedback an die Lotta Entwickler weiter.
              Die Nachricht wird komplett weitergeleitet.
            </p>
            <p>Optional kann dem Feedback eine Nachricht beigefügt werden.</p>
            <p>
              Deine Nutzerdaten werden auch übermittelt, damit wir dich
              kontaktieren können.
            </p>
            <Label label={'Beigefügte Nachricht vom Administrator'}>
              <Input
                autoFocus
                multiline
                id="message"
                name="message"
                placeholder="Hallo Lotta Entwickler, ich habe folgendes Feedback erhalten: ..."
              />
            </Label>
            <Label label={'Weiterzuleitende Nachricht'}>
              <Input
                required
                multiline
                readOnly
                id="feedback"
                placeholder="Nutzerfeedback"
                value={feedback?.content}
              />
            </Label>
            <p>
              Folgende Informationen werden automatisch übermittelt: <br />
              Nutzername, Schulname, URL
            </p>
          </DialogContent>
          <DialogActions>
            <Button
              type={'submit'}
              variant={'fill'}
              icon={<Icon icon={faPaperPlane} size="xl" />}
              disabled={isLoading}
            >
              an Lotta Entwickler weiterleiten
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
ForwardFeedbackDialog.displayName = 'ForwardFeedbackDialog';
