import * as React from 'react';
import { loadFeedback } from 'loader';
import { Feedback } from './Feedback';

export async function FeedbackPage() {
  const feedbacks = await loadFeedback();

  return <Feedback feedbacks={feedbacks} />;
}

export default FeedbackPage;
