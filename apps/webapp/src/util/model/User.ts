import { ArticleModel, FileModel } from 'model';
import { File } from './File';

export const User = {
  getName(
    user?: {
      __typename?: 'User';
      nickname?: string | null;
      name?: string | null;
    } | null
  ) {
    if (user?.name && user?.nickname) {
      return `${user.nickname} (${user.name})`;
    }
    return user?.name ?? user?.nickname ?? '';
  },

  getNickname(
    user?: {
      __typename?: 'User';
      nickname?: string | null;
      name?: string | null;
    } | null
  ) {
    return user?.nickname || user?.name || '';
  },

  getAvatarUrl(
    user?: {
      __typename?: 'User';
      nickname?: string | null;
      name?: string | null;
      avatarImageFile?: Pick<FileModel, '__typename' | 'formats'> | null;
    } | null,
    size = 100
  ) {
    const avatarUrl =
      user?.avatarImageFile &&
      File.getRemoteUrl(user?.avatarImageFile, 'avatar', size);
    return avatarUrl || User.getDefaultAvatarUrl(user);
  },

  getDefaultAvatarUrl(
    user?: {
      __typename?: 'User';
      nickname?: string | null;
      name?: string | null;
    } | null
  ) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      User.getNickname(user) ?? ''
    )}`;
  },

  isAdmin(
    user?: { __typename?: 'User'; groups?: { isAdminGroup: boolean }[] } | null
  ) {
    return user?.groups?.some((g) => g.isAdminGroup) ?? false;
  },

  isAuthor(
    user: { id: string } | null | undefined,
    article: { users?: { id: string }[] }
  ) {
    return Boolean(user && article.users?.find((u) => u.id === user.id));
  },

  canEditArticle(
    user:
      | {
          __typename?: 'User';
          id: string;
          groups?: { isAdminGroup: boolean }[];
        }
      | null
      | undefined,
    article: ArticleModel
  ) {
    return User.isAdmin(user) || this.isAuthor(user, article);
  },
};
