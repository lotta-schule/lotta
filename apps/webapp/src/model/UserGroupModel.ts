import { ID } from './ID';

export interface UserGroupModel {
  __typename?: 'UserGroup';
  id: ID;
  // Match the canonical selection shape from `useUserGroups`: `eduplacesId` is
  // schema-nullable, and the audit/token fields are omitted by most selections.
  // Step toward replacing UserGroupModel with the query-derived type.
  eduplacesId: string | null;
  insertedAt?: string;
  updatedAt?: string;
  name: string;
  isAdminGroup: boolean;
  sortKey: number;
  canReadFullName: boolean;
  enrollmentTokens?: string[];
}

export interface UserGroupInputModel {
  name: string;
  isAdminGroup?: boolean;
  sortKey?: number;
  canReadFullName?: boolean;
  enrollmentTokens?: string[];
}
