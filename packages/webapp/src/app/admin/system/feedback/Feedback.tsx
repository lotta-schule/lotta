'use client'; // this must not be a client component if feedback id is held in url

import * as React from 'react';
import { Table } from '@lotta-schule/hubert';
import { FeedbackModel } from 'model';
import { CreateLottaFeedback, FeedbackRow } from './component';

import styles from './Feedback.module.scss';

export type FeedbackProps = {
  feedbacks: FeedbackModel[];
};

export const Feedback = React.memo(({ feedbacks }: FeedbackProps) => {
  const [activeFeedbackId, setActiveFeedbackId] = React.useState<string | null>(
    null
  );

  const isActive = (feedback: FeedbackModel) =>
    feedback.id === activeFeedbackId;

  return (
    <div className={styles.root}>
      <section className={styles.userFeedback}>
        <h5>Feedback von Nutzern</h5>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Thema</th>
              <th>gesendet am</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <FeedbackRow
                feedback={feedback}
                key={feedback.id}
                isActive={isActive(feedback)}
                onClick={() =>
                  setActiveFeedbackId(isActive(feedback) ? null : feedback.id)
                }
                onDelete={() => setActiveFeedbackId(null)}
              />
            ))}
          </tbody>
        </Table>
      </section>
      <CreateLottaFeedback />
    </div>
  );
});
Feedback.displayName = 'AdminSystemFeedback';
