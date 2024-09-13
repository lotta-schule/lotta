import { FileModel } from './FileModel';

export interface TenantStatsModel {
  articleCount?: number;
  categoryCount?: number;
  fileCount?: number;
  userCount?: number;
}

export interface TenantModel {
  __typename?: 'Tenant';
  id: string;
  insertedAt: string;
  updatedAt: string;
  slug: string;
  title: string;
  host: string;
  identifier?: string;
  logoImageFile?: FileModel | null;
  backgroundImageFile?: FileModel | null;
  configuration: {
    userMaxStorageConfig: string;
    customTheme?: any;
  };
  stats?: TenantStatsModel;
}
