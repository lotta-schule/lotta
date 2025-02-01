import { DirectoryModel } from 'model';
import { User } from './User';

export const File = {
  canEditDirectory(
    directory: DirectoryModel,
    user:
      | {
          __typename?: 'User';
          id: string;
          groups?: { isAdminGroup: boolean }[];
        }
      | null
      | undefined
  ) {
    return user && (directory.user?.id === user.id || User.isAdmin(user));
  },

  canCreateDirectory(
    directory: DirectoryModel,
    user:
      | { __typename: 'User'; id: string; groups?: { isAdminGroup: boolean }[] }
      | null
      | undefined
  ) {
    if (directory.id === null) {
      return true; // Is a root directory
    }
    return this.canEditDirectory(directory, user);
  },

  getFileRemoteLocation(
    baseUrl: string | URL,
    file: { __typename?: 'File'; id: string },
    qs = ''
  ) {
    return [baseUrl.toString(), 'storage', 'f', file.id]
      .join('/')
      .concat(qs ? `?${qs}` : '');
  },

  getFileConversionRemoteLocation(
    baseUrl: string,
    fileConversion: { __typename?: 'FileConversion'; id: string }
  ) {
    return [baseUrl, 'storage', 'fc', fileConversion.id].join('/');
  },
};
