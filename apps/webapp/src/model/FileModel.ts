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

export type AvailableFormat =
  | 'ORIGINAL'
  | 'PREVIEW_200'
  | 'PREVIEW_400'
  | 'PREVIEW_800'
  | 'PREVIEW_1200'
  | 'PREVIEW_1600'
  | 'PREVIEW_2400'
  | 'PREVIEW_3200'
  | 'AVATAR_50'
  | 'AVATAR_100'
  | 'AVATAR_250'
  | 'AVATAR_500'
  | 'AVATAR_1000'
  | 'LOGO_300'
  | 'LOGO_600'
  | 'BANNER_330'
  | 'BANNER_660'
  | 'BANNER_990'
  | 'BANNER_1320'
  | 'ARTICLE_PREVIEW_300'
  | 'ARTICLE_PREVIEW_420'
  | 'ARTICLE_PREVIEW_600'
  | 'ARTICLE_PREVIEW_840'
  | 'PAGEBG_1024'
  | 'PAGEBG_1280'
  | 'PAGEBG_1920'
  | 'PAGEBG_2560'
  | 'ICON_64'
  | 'ICON_128'
  | 'ICON_256'
  | 'WEBM_720P'
  | 'WEBM_1080P'
  | 'H264_720P'
  | 'H264_1080P';

export type FileModelType = 'PDF' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'BINARY';

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
  formats: {
    name: AvailableFormat;
    url: string;
    type: FileModelType;
    status: 'READY' | 'AVAILABLE' | 'REQUESTABLE';
  }[];
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
