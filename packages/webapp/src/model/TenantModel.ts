import { FileModel } from './FileModel';

export interface TenantModel {
  id: string;
  insertedAt: string;
  updatedAt: string;
  slug: string;
  title: string;
  host: string;
  configuration: {
    userMaxStorageConfig: string;
    customTheme?: any;
    logoImageFile?: FileModel | null;
    backgroundImageFile?: FileModel | null;
  };
}
