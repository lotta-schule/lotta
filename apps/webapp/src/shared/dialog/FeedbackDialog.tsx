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
import { Icon } from 'shared/Icon';
import { FeedbackModel } from 'model';

import CreateFeedbackMutation from 'api/mutation/CreateFeedbackMutation.graphql';

export interface FeedbackDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const FeedbackDialog = React.memo(
  ({ isOpen, onRequestClose }: FeedbackDialogProps) => {
    const formRef = React.useRef<HTMLFormElement>(null);
    const [createFeedback, { error, loading: isLoading }] = useMutation<{
      feedback: FeedbackModel;
    }>(CreateFeedbackMutation);

    const defaultMetadata =
      typeof window !== 'undefined'
        ? [
            `User-Agent: ${navigator.userAgent}`,
            `Platform: ${navigator.platform}`,
            `Screen: ${window.screen.width}x${window.screen.height}`,
            `Window: ${window.innerWidth}x${window.innerHeight}`,
            `DevicePixelRatio: ${window.devicePixelRatio}`,
            `DeviceOrientation: ${
              window.screen.orientation?.type ?? 'unbekannt'
            }`,
          ].join('\n')
        : '';

    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Feedback schreiben'}
        open={isOpen}
      >
        {error && <ErrorMessage error={error} />}
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createFeedback({
              variables: {
                feedback: {
                  topic: formData.get('topic') as string,
                  content: formData.get('content') as string,
                  metadata: formData.get('metadata') as string,
                },
              },
            }).then(() => {
              formRef.current?.reset();
              onRequestClose();
            });
          }}
        >
          <DialogContent>
            <Label label={'Thema auswählen oder kurz beschreiben'}>
              <Input
                autoFocus
                required
                id="topic"
                name="topic"
                placeholder="Thema"
                maxLength={200}
              />
            </Label>
            <Label
              label={'Nachricht (gib so viele Informationen wir möglich ein)'}
            >
              <Input
                required
                multiline
                id="content"
                name="content"
                placeholder="Nachricht"
              />
            </Label>
            <Label
              label={
                'Informationen über dein System. Lösche Zeilen, die du nicht teilen möchtest.'
              }
            >
              <Input
                multiline
                id="metadata"
                name="metadata"
                placeholder="Informationen"
                defaultValue={defaultMetadata}
              />
            </Label>
            <p>
              Folgende Informationen werden an die Administratoren deiner Schule
              automatisch übermittelt: <br />
              Dein Nutzername sowie deine im Profil hinterlegten Informationen
              wie deine E-Mail-Adresse.
            </p>
          </DialogContent>
          <DialogActions>
            <Button
              type={'submit'}
              variant="fill"
              icon={<Icon icon={faPaperPlane} size="xl" />}
              disabled={isLoading}
            >
              an Administratoren senden
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
FeedbackDialog.displayName = 'FeedbackDialog';
