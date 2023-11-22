import * as React from 'react';
import { Button, Input, Label, Table } from '@lotta-schule/hubert';
import { faPaperPlane, faShare } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { Icon } from 'shared/Icon';
import { ForwardFeedbackDialog } from './feedback/ForwardFeedbackDialog';
import { RespondToFeedbackDialog } from './feedback/RespondToFeedbackDialog';
import clsx from 'clsx';

import styles from '../shared.module.scss';

export const Feedback = React.memo(({}) => {
  const [isForwardFeedbackDialogOpen, setIsForwardFeedbackDialogOpen] =
    React.useState(false);
  const [isRespondToFeedbackDialogOpen, setIsRespondToFeedbackDialogOpen] =
    React.useState(false);
  return (
    <div className={styles.rootFeedback}>
      <section className={styles.userFeedback}>
        <h5>Feedback von Nutzern</h5>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Thema</th>
              <th>gesendet am</th>
            </tr>
          </thead>
          <tbody>
            <tr className={clsx(styles.titleRow, styles.activeRow)}>
              <td>Profilbild</td>
              <td>Nutzerfrau</td>
              <td>Beispielthema</td>
              <td>01.01.2024</td>
            </tr>
            <tr className={clsx(styles.infoRow, styles.activeRow)}>
              <td colSpan={4}>
                <h6>Nachricht:</h6>
                <div className={styles.messageSection}>
                  <div className={styles.message}>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet.
                  </div>
                  <div className={styles.buttons}>
                    <Button
                      variant="fill"
                      icon={<Icon icon={faShare} size="xl" />}
                      onClick={() => setIsForwardFeedbackDialogOpen(true)}
                    >
                      weiterleiten
                    </Button>
                    <Button
                      icon={<Icon icon={faCommentDots} size="xl" />}
                      className={styles.answerButton}
                      onClick={() => setIsRespondToFeedbackDialogOpen(true)}
                    >
                      beantworten
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
            <tr className={clsx(styles.titleRow)}>
              <td>Profilbild</td>
              <td>Nutzermann</td>
              <td>Beispielthema</td>
              <td>31.12.2023</td>
            </tr>
            <tr className={clsx(styles.titleRow)}>
              <td>Profilbild</td>
              <td>Nutzerschüler</td>
              <td>Beispielthema</td>
              <td>03.12.2023</td>
            </tr>
          </tbody>
        </Table>
      </section>
      <section className={styles.adminFeedback}>
        <h5>Feedback an Lotta Entwickler</h5>
        <Label label={'E-Mail (vom System voreingestellt)'}>
          <Input
            autoFocus
            required
            id="email"
            placeholder="admin@beispielschule.org"
            type="email"
            maxLength={100}
            className={styles.inputField}
          />
        </Label>
        <Label label={'Thema'}>
          <Input
            autoFocus
            required
            id="topic"
            placeholder="Beispielthema"
            type="topic"
            maxLength={100}
            className={styles.inputField}
          />
        </Label>
        <Label label={'Nachricht'}>
          <Input
            autoFocus
            required
            id="topic"
            placeholder="Nachricht"
            type="topic"
            className={styles.inputField}
          />
        </Label>
        <p className={styles.infoText}>
          Folgende Informationen werden automatisch übermittelt: <br />
          Nutzername, Schulname, URL
        </p>
        <div className={styles.submitButton}>
          <Button variant="fill" icon={<Icon icon={faPaperPlane} size="xl" />}>
            senden
          </Button>
        </div>
      </section>
      <ForwardFeedbackDialog
        isOpen={isForwardFeedbackDialogOpen}
        onRequestClose={() => setIsForwardFeedbackDialogOpen(false)}
      />
      <RespondToFeedbackDialog
        isOpen={isRespondToFeedbackDialogOpen}
        onRequestClose={() => setIsRespondToFeedbackDialogOpen(false)}
      />
    </div>
  );
});
Feedback.displayName = 'AdminSystemFeedback';
