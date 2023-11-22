import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  Label,
  LoadingButton,
} from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// import styles from './ForwardFeedbackDialog.module.scss';

export interface ForwardFeedbackDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const ForwardFeedbackDialog = React.memo<ForwardFeedbackDialogProps>(
  ({ isOpen, onRequestClose }) => {
    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Feedback weiterleiten'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('test');
          }}
        >
          <DialogContent>
            <Label label={'E-Mail (vom System voreingestellt)'}>
              <Input
                autoFocus
                required
                id="email"
                placeholder="admin@beispielschule.org"
                type="email"
                maxLength={100}
              />
            </Label>
            <Label label={'Betreff'}>
              <Input
                autoFocus
                required
                id="topic"
                placeholder="Weiterleitung des Feedbacks zum Thema 'XYZ' "
                maxLength={200}
              />
            </Label>
            <Label label={'Weiterzuleitende Nachricht'}>
              <Input
                autoFocus
                required
                multiline
                id="content"
                placeholder="Nutzerfeedback"
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
              variant="fill"
              icon={<Icon icon={faPaperPlane} size="xl" />}
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
