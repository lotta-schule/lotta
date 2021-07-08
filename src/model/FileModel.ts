import { ID } from './ID';
import { UserModel } from './UserModel';
import { TenantModel } from './TenantModel';
import { ArticleModel } from './ArticleModel';
import { ContentModuleModel } from './ContentModuleModel';
import { CategoryModel } from './CategoryModel';

export interface DirectoryModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    name: string;
    user?: Partial<UserModel>;
    parentDirectory?: Partial<DirectoryModel>;
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
    id: ID;
    userId: ID;
    user?: UserModel;
    insertedAt: string;
    updatedAt: string;
    filename: string;
    filesize: number;
    remoteLocation: string;
    mimeType: string;
    fileType: FileModelType;
    parentDirectory: Partial<DirectoryModel>;
    fileConversions: FileConversion[];
    usage?: FileModelUsageLocation[];
}

export interface FileConversion {
    id?: ID;
    fileType: FileModelType;
    format: string;
    mimeType: string;
    remoteLocation: string;
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
