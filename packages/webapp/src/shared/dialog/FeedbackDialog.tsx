import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// import styles from './FeedbackDialog.module.scss';

export interface FeedbackDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const FeedbackDialog = React.memo<FeedbackDialogProps>(
  ({ isOpen, onRequestClose }) => {
    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Feedback schreiben'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('test');
          }}
        >
          <DialogContent>
            <Label label={'Thema auswählen oder kurz beschreiben'}>
              <Input
                autoFocus
                required
                id="topic"
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
                placeholder="Informationen zu deinem Gerät, Betriebssystem, Browser, etc."
              />
            </Label>
            <p>
              ACHTUNG <br />
              Folgende Informationen werden an die Administratoren deiner Schule
              automatisch übermittelt: <br />
              Dein Nutzername sowie deine im Profil hinterlegte E-Mail Adresse.
            </p>
          </DialogContent>
          <DialogActions>
            <Button
              type={'submit'}
              variant="fill"
              icon={<Icon icon={faPaperPlane} size="xl" />}
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
