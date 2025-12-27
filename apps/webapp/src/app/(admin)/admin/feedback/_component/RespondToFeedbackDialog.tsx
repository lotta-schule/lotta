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
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client/react';
import { FeedbackModel } from 'model';
import { Icon } from 'shared/Icon';

import styles from './RespondToFeedbackDialog.module.scss';

import RespondToFeedbackMutation from 'api/mutation/RespondToFeedbackMutation.graphql';

export interface RespondToFeedbackDialogProps {
  feedback: FeedbackModel;
  isOpen: boolean;
  onRequestClose(): void;
}

export const RespondToFeedbackDialog = React.memo(
  ({ feedback, isOpen, onRequestClose }: RespondToFeedbackDialogProps) => {
    const [sendFeedback, { error, loading: isLoading }] = useMutation<
      {
        feedback: FeedbackModel;
      },
      { id: string; subject?: string; message: string }
    >(RespondToFeedbackMutation);

    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Nutzerfeedback beantworten'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            sendFeedback({
              variables: {
                id: feedback.id,
                subject: formData.get('subject') as string,
                message: formData.get('message') as string,
              },
            }).then(() => {
              onRequestClose();
            });
          }}
        >
          <DialogContent className={styles.root}>
            {error && <ErrorMessage error={error} />}
            <p>
              Hier kannst du auf das Feedback des Nutzers antworten. Die Antwort
              wird an den Nutzer per E-Mail versendet.
            </p>
            <p>Dem Nutzer wird dein Name angezeigt.</p>
            <Label label={'Betreff'}>
              <Input
                required
                id="subject"
                name="subject"
                defaultValue={`Antwort auf dein Feedback ${feedback.topic}`}
                maxLength={200}
              />
            </Label>
            <Label label={'Antwort'}>
              <Input
                required
                multiline
                id="message"
                name="message"
                placeholder="Antwort an Nutzer"
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              type={'submit'}
              variant={'fill'}
              disabled={isLoading}
              icon={<Icon icon={faPaperPlane} size="xl" />}
            >
              an Nutzer senden
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
RespondToFeedbackDialog.displayName = 'RespondToFeedbackDialog';
