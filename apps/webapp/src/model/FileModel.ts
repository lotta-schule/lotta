import { graphql, type ResultOf } from '#/api/graphql';
import { ID } from './ID';
import { UserModel } from './UserModel';
import { TenantModel } from './TenantModel';
import { ArticleModel } from './ArticleModel';
import { ContentModuleModel } from './ContentModuleModel';
import { CategoryModel } from './CategoryModel';

// Source the format/type enums from the GraphQL schema (via gql.tada) instead of
// re-maintaining them by hand — the hand-written unions had drifted from the schema.
// Step toward replacing FileModel entirely with GraphQL-derived types.
const _availableFormatFields = graphql(`
  fragment AvailableFormatFields on AvailableFormat {
    name
    type
  }
`);
type _AvailableFormatFields = ResultOf<typeof _availableFormatFields>;

export interface DirectoryModel {
  __typename?: 'Directory';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  name: string;
  user?: Partial<UserModel> | null;
  parentDirectory?: Partial<DirectoryModel> | null;
}

export type AvailableFormat = _AvailableFormatFields['name'];

export type FileModelType = _AvailableFormatFields['type'];

export interface FileModel {
  __typename?: 'File';
  id: ID;
  userId?: ID;
  user?: UserModel;
  insertedAt?: string;
  updatedAt?: string;
  filename?: string;
  filesize?: number;
  mimeType?: string;
  fileType?: FileModelType;
  parentDirectory?: Partial<DirectoryModel>;
  formats: {
    name: AvailableFormat;
    url: string | null;
    type?: FileModelType;
    mimeType?: string;
    availability: {
      status: 'READY' | 'AVAILABLE' | 'REQUESTABLE' | 'PROCESSING' | 'FAILED';
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
