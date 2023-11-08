import * as React from 'react';
import { Box, ErrorMessage, Input, Label } from '@lotta-schule/hubert';
import { useTenant } from 'util/tenant/useTenant';
import { FileSize } from 'util/FileSize';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import styles from '../shared.module.scss';
import element from 'slate-react/dist/components/element';

export const Feedback = React.memo(({}) => {
  return (
    <div className={styles.rootFeedback}>
      <section className={styles.userFeedback}>
        <h5>Feedback von Nutzern</h5>
      </section>
      <section className={styles.adminFeedback}>
        <h5>Feedback an Lotta Entwickler</h5>
        <Label label={'Deine Email-Adresse'}>
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
      </section>
    </div>
  );
});
Feedback.displayName = 'AdminSystemFeedback';
