import * as React from 'react';
import { loadFeedback } from 'loader';
import { Feedback } from './Feedback';

async function FeedbackPage() {
  const feedbacks = await loadFeedback();

  return <Feedback feedbacks={feedbacks} />;
}

export default FeedbackPage;
