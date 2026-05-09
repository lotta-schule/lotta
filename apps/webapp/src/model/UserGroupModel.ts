import { ID } from './ID.js';

export interface UserGroupModel {
  __typename?: 'UserGroup';
  id: ID;
  eduplacesId: string;
  insertedAt: string;
  updatedAt: string;
  name: string;
  isAdminGroup: boolean;
  sortKey: number;
  canReadFullName: boolean;
  enrollmentTokens: string[];
}

export interface UserGroupInputModel {
  name: string;
  isAdminGroup?: boolean;
  sortKey?: number;
  canReadFullName?: boolean;
  enrollmentTokens?: string[];
}
