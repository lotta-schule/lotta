import { DirectoryModel, FileModel } from 'model';
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

  getAvailableFormats(
    file: Pick<FileModel, '__typename' | 'formats'>,
    format?: string
  ) {
    return (
      file?.formats
        ?.filter(
          (availableFormat) =>
            ['ready', 'available'].includes(
              availableFormat.availability.status.toLowerCase()
            ) &&
            (!format ||
              availableFormat.name
                .toLowerCase()
                .startsWith(format.toLowerCase()))
        )
        .map((format) => {
          const formatMatch = format.name.match(
            /_(?:(?<width>\d+))(?:x(?<height>\d+))?/
          );
          if (!formatMatch) {
            return null;
          }
          const width = formatMatch.groups?.width
            ? parseInt(formatMatch.groups.width, 10)
            : undefined;
          const height = formatMatch.groups?.height
            ? parseInt(formatMatch.groups.height, 10)
            : undefined;

          return {
            ...format,
            width: width,
            height,
          };
        })
        .filter((f) => f !== null) ?? []
    );
  },

  getRemoteUrl(
    file: Pick<FileModel, '__typename' | 'formats'>,
    format?: string,
    width?: number
  ) {
    return File.getAvailableFormats(file, format).findLast(
      ({ width: w }, i) => !width || !w || width >= w || i === 0
    )?.url;
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
