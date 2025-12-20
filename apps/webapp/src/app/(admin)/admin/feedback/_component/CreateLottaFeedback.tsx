'use client';
import * as React from 'react';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Input, Label } from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client/react';
import { Icon } from 'shared/Icon';

import styles from './CreateLottaFeedback.module.scss';

import CreateLottaFeedbackMutation from 'api/mutation/CreateLottaFeedbackMutation.graphql';

export const CreateLottaFeedback = React.memo(() => {
  const [sendFeedback, { error, loading: isLoading }] = useMutation<
    boolean,
    { subject?: string; message: string }
  >(CreateLottaFeedbackMutation);
  return (
    <section className={styles.root}>
      <h5>Feedback an Lotta Entwickler</h5>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          sendFeedback({
            variables: {
              subject: formData.get('subject') as string,
              message: formData.get('message') as string,
            },
          }).then(() => {
            alert('Feedback wurde gesendet');
            form.reset();
          });
        }}
      >
        {error && <ErrorMessage error={error} />}
        <Label label={'Thema'}>
          <Input
            autoFocus
            placeholder="Frage zu lotta"
            id="subject"
            name="subject"
            maxLength={200}
          />
        </Label>
        <Label label={'Nachricht'}>
          <Input required id="message" name="message" placeholder="Nachricht" />
        </Label>
        <p>
          Folgende Informationen werden automatisch übermittelt: <br />
          Nutzername, Schulname, URL
        </p>
        <div className={styles.submitButton}>
          <Button
            variant={'fill'}
            disabled={isLoading}
            icon={<Icon icon={faPaperPlane} size="xl" />}
            type="submit"
          >
            senden
          </Button>
        </div>
      </form>
    </section>
  );
});
CreateLottaFeedback.displayName = 'CreateLottaFeedback';
