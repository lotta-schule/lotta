import { UserModel } from './UserModel';

export type FeedbackModel = {
  id: string;
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
