import { FileModel } from './FileModel.js';

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
  slug: string;
  title: string;
  host: string;
  identifier?: string;
  logoImageFile?: FileModel | null;
  backgroundImageFile?: FileModel | null;
  configuration: {
    userMaxStorageConfig: string | null;
    customTheme?: any;
  };
  stats?: TenantStatsModel;
}
