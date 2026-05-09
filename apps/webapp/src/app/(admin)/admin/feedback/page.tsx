import * as React from 'react';
import { loadFeedback } from '#/loader/index.js';
import { Feedback } from './Feedback.js';
import { AdminPage } from '#/app/(admin)/admin/_component/AdminPage.js';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

async function FeedbackPage() {
  const feedbacks = await loadFeedback();

  return (
    <AdminPage hasHomeLink icon={faCommentDots} title="Feedback">
      <Feedback feedbacks={feedbacks} />
    </AdminPage>
  );
}

export default FeedbackPage;
