import { ID } from './ID';
import { UserModel } from './UserModel';
import { TenantModel } from './TenantModel';
import { ArticleModel } from './ArticleModel';
import { ContentModuleModel } from './ContentModuleModel';
import { CategoryModel } from './CategoryModel';

export interface DirectoryModel {
  __typename?: 'Directory';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  name: string;
  user?: Partial<UserModel> | null;
  parentDirectory?: Partial<DirectoryModel> | null;
}

export enum FileModelType {
  Pdf = 'PDF',
  Image = 'IMAGE',
  Video = 'VIDEO',
  Audio = 'AUDIO',
  Misc = 'MISC',
  Directory = 'DIRECTORY',
}

export interface FileModel {
  __typename?: 'File';
  id: ID;
  userId: ID;
  user?: UserModel;
  insertedAt: string;
  updatedAt: string;
  filename: string;
  filesize: number;
  mimeType: string;
  fileType: FileModelType;
  parentDirectory: Partial<DirectoryModel>;
  fileConversions: FileConversionModel[];
  usage?: FileModelUsageLocation[];
}

export interface FileConversionModel {
  __typename?: 'FileConversion';
  id?: ID;
  fileType: FileModelType;
  format: string;
  mimeType: string;
  insertedAt: string;
  updatedAt: string;
}

export type FileModelUsageLocation = Partial<FileModelTenantUsageLocation> &
  Partial<FileModelUserUsageLocation> &
  Partial<FileModelContentModuleUsageLocation> &
  Partial<FileModelArticleUsageLocation> &
  Partial<FileModelCategoryUsageLocation>;
export interface FileModelTenantUsageLocation {
  usage: string;
  tenant: TenantModel;
}
export interface FileModelCategoryUsageLocation {
  usage: string;
  category: CategoryModel;
}
export interface FileModelUserUsageLocation {
  usage: string;
  user: UserModel;
}
export interface FileModelContentModuleUsageLocation {
  usage: string;
  contentModule: ContentModuleModel;
  article: ArticleModel;
}
export interface FileModelArticleUsageLocation {
  usage: string;
  article: ArticleModel;
}
