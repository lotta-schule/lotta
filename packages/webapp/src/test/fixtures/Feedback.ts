import { FeedbackModel } from 'model';

export const newFeedback: FeedbackModel = {
  id: '6543-feed-back-1234',
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isForwarded: false,
  isResponded: false,
  isNew: true,
  topic: 'Feedback A',
  content: 'Feedback A content',
};

export const readFeedback: FeedbackModel = {
  id: '6973-feed-back-1432',
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isForwarded: false,
  isResponded: false,
  isNew: false,
  topic: 'Feedback B',
  content: 'Feedback B content',
};

export const respondedFeedback: FeedbackModel = {
  id: '1111-feed-back-1234',
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isForwarded: false,
  isResponded: true,
  isNew: false,
  topic: 'Feedback C',
  content: 'Feedback C content',
};

export const forwardedFeedback: FeedbackModel = {
  id: '9999-feed-back-1234',
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isForwarded: true,
  isResponded: false,
  isNew: false,
  topic: 'Feedback D',
  content: 'Feedback D content',
};

export const feedbacks = [
  newFeedback,
  readFeedback,
  respondedFeedback,
  forwardedFeedback,
];
