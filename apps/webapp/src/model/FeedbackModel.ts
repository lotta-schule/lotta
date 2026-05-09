import { ID } from './ID.js';
import { UserModel } from './UserModel.js';

export type FeedbackModel = {
  __typename?: 'Feedback';
  id: ID;
  topic: string;
  content: string;
  metadata?: string;
  user?: UserModel;
  isNew?: boolean;
  isForwarded?: boolean;
  isResponded?: boolean;
  insertedAt: string;
  updatedAt?: string;
};
