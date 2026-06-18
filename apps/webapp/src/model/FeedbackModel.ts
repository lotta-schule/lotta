import { ID } from './ID';
import { UserModel } from './UserModel';

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
