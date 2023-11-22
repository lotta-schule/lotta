import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

import styles from './RespondToFeedbackDialog.module.scss';

export interface RespondToFeedbackDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const RespondToFeedbackDialog = React.memo<RespondToFeedbackDialogProps>(
  ({ isOpen, onRequestClose }) => {
    return (
      <Dialog
        onRequestClose={onRequestClose}
        title={'Nutzerfeedback Beantworten'}
        open={isOpen}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('test');
          }}
        >
          <DialogContent className={styles.root}>
            <div className={styles.userInformation}>
              <Label label={'Nutzer'}>
                <Input disabled maxLength={100} id="username" />
              </Label>
              <Label label={'E-Mail Adresse von Nutzer'}>
                <Input disabled id="email" className={styles.userMail} />
              </Label>
            </div>
            <Label label={'Betreff'}>
              <Input
                required
                id="topic"
                placeholder="Antwort zu deinem Feedback 'XYZ' "
                type="topic"
                maxLength={200}
              />
            </Label>
            <Label label={'Antwort'}>
              <Input
                required
                multiline
                id="content"
                placeholder="Antwort an Nutzer"
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              type={'submit'}
              variant="fill"
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
