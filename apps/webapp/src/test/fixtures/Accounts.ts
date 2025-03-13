import { DirectoryModel, FileModel, UserModel } from 'model';

/*
 *
 * UserGroups
 *
 */

export const adminGroup = {
  id: '1',
  insertedAt: '2015-01-01 00:00',
  updatedAt: '2015-01-01 00:00',
  name: 'Administrator',
  canReadFullName: null,
  sortKey: 1000,
  isAdminGroup: true,
  enrollmentTokens: [],
};

export const lehrerGroup = {
  id: '4',
  insertedAt: '2015-01-01 00:00',
  updatedAt: '2015-01-01 00:00',
  name: 'Lehrer',
  canReadFullName: true,
  sortKey: 2000,
  isAdminGroup: false,
  enrollmentTokens: ['uhfhurehwuehf'],
};

export const elternGroup = {
  id: '10',
  insertedAt: '2015-01-10 11:00',
  updatedAt: '2015-01-12 14:00',
  name: 'Eltern',
  canReadFullName: null,
  sortKey: 3000,
  isAdminGroup: false,
  enrollmentTokens: [],
};

export const schuelerGroup = {
  id: '5',
  insertedAt: '2015-01-01 07:45',
  updatedAt: '2015-01-01 07:45',
  name: 'Schüler',
  sortKey: 2000,
  canReadFullName: false,
  isAdminGroup: false,
  enrollmentTokens: ['ajf82j84h2h', 'uishfiji2j38f'],
};

export const userGroups = [adminGroup, lehrerGroup, schuelerGroup, elternGroup];

/*
 *
 * Directories
 *
 */

export const logosDirectory = {
  __typename: 'Directory',
  id: '8743',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Logos',
  parentDirectory: null,
} as DirectoryModel;

export const profilDirectory = {
  __typename: 'Directory',
  id: '8744',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Profil',
  parentDirectory: null,
};

export const podcastsDirectory = {
  __typename: 'Directory',
  id: '8745',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Podcasts',
  parentDirectory: null,
};

export const videoPodcastsDirectory = {
  __typename: 'Directory',
  id: '8790',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Video-Podcasts',
  parentDirectory: podcastsDirectory,
};

export const audioPodcastsDirectory = {
  __typename: 'Directory',
  id: '8791',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Audio-Podcasts',
  parentDirectory: podcastsDirectory,
};

export const schulweitDirectory = {
  __typename: 'Directory',
  id: '8746',
  insertedAt: '2010-01-01 10:00',
  updatedAt: '2010-01-01 10:00',
  name: 'Schulweit',
  parentDirectory: null,
  user: null,
};

/*
 *
 * Files
 *
 */

const commonFormats = [
  'preview_200',
  'preview_400',
  'preview_800',
  'preview_1200',
  'preview_1600',
  'preview_2400',
  'preview_3200',
];
export const getDefaultFormats = (type: 'image' | 'video' | 'misc') => {
  if (type === 'image') {
    return [
      ...commonFormats,
      'avatar_50',
      'avatar_100',
      'avatar_250',
      'avatar_500',
      'avatar_1000',
      'logo_300',
      'logo_600',
      'banner_330',
      'banner_660',
      'banner_990',
      'banner_1320',
      'articlepreview_330',
      'articlepreview_660',
      'pagebg_1024',
      'pagebg_1280',
      'pagebg_1920',
      'pagebg_2560',
      'icon_64',
      'icon_128',
      'icon_256',
    ];
  }
  if (type === 'video') {
    return [
      ...commonFormats,
      'webm_480',
      'webm_720',
      'webm_1080',
      'h264_480',
      'h264_720',
      'h265_1080',
    ];
  }
  return [];
};
export const createFormats = (
  path: string,
  filetype: 'image' | 'video' | 'misc'
) =>
  getDefaultFormats(filetype).map((f) => {
    return {
      name: f,
      url: `https://example.com/${path}/${f}`,
      type: f.startsWith('webm') || f.startsWith('h264') ? 'video' : 'image',
      status: 'READY',
    };
  });

export const imageFile = {
  __typename: 'File',
  id: '123',
  filename: 'Dateiname.jpg',
  filesize: 123123,
  fileType: 'IMAGE',
  mimeType: 'image/jpg',
  insertedAt: '2001-01-01 14:15',
  updatedAt: '2001-01-01 14:15',
  formats: createFormats('123', 'image'),
  usage: [],
} as Partial<FileModel> as FileModel;

export const otherImageFile = {
  __typename: 'File',
  id: '245',
  filename: 'Animiert.gif',
  filesize: 2123123,
  fileType: 'IMAGE',
  mimeType: 'image/gif',
  insertedAt: '2001-01-01 14:15',
  updatedAt: '2001-01-01 14:15',
  formats: createFormats('245', 'image'),
  usage: [],
} as Partial<FileModel> as FileModel;

export const documentFile = {
  __typename: 'File',
  id: '5445',
  filename: 'Manifest.pdf',
  filesize: 822123123,
  fileType: 'PDF',
  mimeType: 'application/pdf',
  insertedAt: '1848-02-21 00:00',
  updatedAt: '1848-02-21 00:00',
  formats: createFormats('5445', 'misc'),
  usage: [],
} as Partial<FileModel> as FileModel;

export const convertedDocumentFile = {
  __typename: 'File',
  id: '5545',
  filename: 'Bilderbuch.pdf',
  filesize: 2123123,
  fileType: 'PDF',
  mimeType: 'application/pdf',
  insertedAt: '2001-01-21 00:00',
  updatedAt: '2001-01-21 00:00',
  usage: [],
  formats: createFormats('5545', 'misc'),
} as Partial<FileModel> as FileModel;

export const podcastTextFile = {
  __typename: 'File',
  id: '5546',
  filename: 'Podcast.txt',
  filesize: 2123123,
  fileType: 'BINARY',
  mimeType: 'text/plain',
  insertedAt: '2001-01-21 00:00',
  updatedAt: '2001-01-21 00:00',
  usage: [],
  formats: createFormats('5546', 'misc'),
} as Partial<FileModel> as FileModel;

export const movieFile = {
  __typename: 'File',
  id: '75000',
  filename: 'Amelie.mp4',
  filesize: 2323232123123,
  fileType: 'VIDEO',
  mimeType: 'video/mp4',
  insertedAt: '2001-01-21 00:00',
  updatedAt: '2001-01-21 00:00',
  usage: [],
  formats: createFormats('75000', 'video'),
} as Partial<FileModel> as FileModel;

export const audioFile = {
  __typename: 'File',
  id: '99000',
  filename: 'Kaenguru.wav',
  filesize: 3232123123,
  fileType: 'AUDIO',
  mimeType: 'audio/wav',
  insertedAt: '2001-01-21 00:00',
  updatedAt: '2001-01-21 00:00',
  usage: [],
  formats: createFormats('99000', 'misc'),
} as Partial<FileModel> as FileModel;

export const powerpointFile = {
  __typename: 'File',
  id: '20',
  filename: 'praesi.ppt',
  filesize: 23123,
  fileType: 'BINARY',
  mimeType: 'application/mspowerpoint',
  insertedAt: '2001-01-21 00:00',
  updatedAt: '2001-01-21 00:00',
  usage: [],
  formats: createFormats('20', 'misc'),
} as Partial<FileModel> as FileModel;

/*
 *
 *
 * Users
 *
 *
 *
 *
 */

export const SomeUser = {
  id: '1',
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  email: 'userAvatar@lotta.schule',
  name: 'Ernesto Guevara',
  class: '5/1',
  unreadMessages: 0,
  groups: [],
  assignedGroups: [],
  enrollmentTokens: [],
  hideFullName: false,
  nickname: 'Che',
  avatarImageFile: null,
  hasChangedDefaultPassword: true,
};

export const SomeUserin = {
  id: '2',
  insertedAt: '2019-05-18 10:00',
  updatedAt: '2019-05-18 10:00',
  lastSeen: '2019-05-18 10:00',
  email: 'userin@andereandresse.com',
  name: 'Luisa Drinalda',
  class: '',
  unreadMessages: 0,
  groups: [],
  assignedGroups: [],
  enrollmentTokens: [],
  hideFullName: true,
  nickname: 'Lui',
  avatarImageFile: null,
  hasChangedDefaultPassword: true,
};

export const KeinErSieEsUser = {
  id: '3',
  insertedAt: '2019-05-18 10:00',
  updatedAt: '2019-05-18 10:00',
  lastSeen: '2019-05-18 10:00',
  email: 'userin@andereandresse.com',
  name: 'Michel Dupond (das frz. Michel)',
  class: '',
  unreadMessages: 0,
  groups: [],
  assignedGroups: [],
  enrollmentTokens: [],
  hideFullName: false,
  nickname: 'Mich',
  avatarImageFile: null,
  hasChangedDefaultPassword: true,
};

export const getPrivateAndPublicFiles = (user: UserModel) => {
  const directories = [
    logosDirectory,
    profilDirectory,
    podcastsDirectory,
    videoPodcastsDirectory,
    audioPodcastsDirectory,
  ].map((directory) => ({ ...directory, user }));

  return [
    schulweitDirectory,
    ...directories,
    ...[
      { ...imageFile, parentDirectory: directories[0] },
      { ...otherImageFile, parentDirectory: directories[0] },
      { ...documentFile, parentDirectory: directories[1] },
      { ...convertedDocumentFile, parentDirectory: directories[1] },
      { ...podcastTextFile, parentDirectory: directories[2] },
      { ...movieFile, parentDirectory: directories[3] },
      { ...audioFile, parentDirectory: directories[4] },
      { ...powerpointFile, parentDirectory: directories[1] },
    ].map((fileOrDirectory) => ({ ...fileOrDirectory, userId: user.id })),
  ];
};
