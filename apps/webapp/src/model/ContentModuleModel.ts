import { FileModel } from './FileModel';
import { ID } from './ID';

export enum ContentModuleType {
  TITLE = 'TITLE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  IMAGE_COLLECTION = 'IMAGE_COLLECTION',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOWNLOAD = 'DOWNLOAD',
  FORM = 'FORM',
  TABLE = 'TABLE',
  DIVIDER = 'DIVIDER',
}

export interface ContentModuleModel<C = any, T = any> {
  __typename?: 'ContentModule';
  id: ID;
  type: ContentModuleType;
  insertedAt: string;
  updatedAt: string;
  sortKey: number;
  content?: C | null;
  files: FileModel[];
  configuration?: T;
}

export interface ContentModuleResultModel<T = any> {
  __typename?: 'ContentModuleResult';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  result: T;
}

export type ContentModuleInput = Omit<ContentModuleModel, 'id'>;
