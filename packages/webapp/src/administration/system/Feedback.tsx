import * as React from 'react';
import { ErrorMessage, Table } from '@lotta-schule/hubert';
import { useQuery } from '@apollo/client';
import { FeedbackModel } from 'model';
import { FeedbackRow } from './feedback/FeedbackRow';
import { CreateLottaFeedback } from './feedback/CreateLottaFeedback';

import styles from './Feedback.module.scss';

import GetFeedbackQuery from 'api/query/GetFeedbackQuery.graphql';

export const Feedback = React.memo(() => {
  const [activeFeedbackId, setActiveFeedbackId] = React.useState<string | null>(
    null
  );

  const { data, error } = useQuery<{ feedbacks: FeedbackModel[] }>(
    GetFeedbackQuery
  );

  const isActive = (feedback: FeedbackModel) =>
    feedback.id === activeFeedbackId;

  return (
    <div className={styles.root}>
      <section className={styles.userFeedback}>
        <h5>Feedback von Nutzern</h5>
        {error && <ErrorMessage error={error} />}
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
            {data?.feedbacks.map((feedback) => (
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
