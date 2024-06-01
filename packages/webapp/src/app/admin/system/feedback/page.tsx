import * as React from 'react';
import { loadFeedback } from 'loader';
import { Feedback } from './Feedback';
import { AdminPage } from 'app/admin/_component/AdminPage';
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
