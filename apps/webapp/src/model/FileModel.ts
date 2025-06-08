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
  | 'PRESENT_1200'
  | 'PRESENT_1600'
  | 'PRESENT_2400'
  | 'PRESENT_3200'
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
  | 'ARTICLEPREVIEW_330'
  | 'ARTICLEPREVIEW_660'
  | 'PAGEBG_1024'
  | 'PAGEBG_1280'
  | 'PAGEBG_1920'
  | 'PAGEBG_2560'
  | 'ICON_64'
  | 'ICON_128'
  | 'ICON_256'
  | 'POSTER_1080P'
  | 'VIDEOPLAY_200P_WEBM'
  | 'VIDEOPLAY_480P_WEBM'
  | 'VIDEOPLAY_720P_WEBM'
  | 'VIDEOPLAY_1080P_WEBM'
  | 'VIDEOPLAY_200P_MP4'
  | 'VIDEOPLAY_480P_MP4'
  | 'VIDEOPLAY_720P_MP4'
  | 'VIDEOPLAY_1080P_MP4'
  | 'AUDIOPLAY_AAC'
  | 'AUDIOPLAY_OGG';

export type FileModelType =
  | 'PDF'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'BINARY'
  | 'MISC';

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
    mimeType: string;
    availability: {
      status: 'ready' | 'available' | 'requestable' | 'processing' | 'error';
      progress?: number;
      error?: string;
    };
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
