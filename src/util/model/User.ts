import { UserModel, ArticleModel } from 'model';
import { File } from './File';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export const User = {
    getName(user?: UserModel | null) {
        if (user?.name && user?.nickname) {
            return `${user.nickname} (${user.name})`;
        }
        return user?.name ?? user?.nickname ?? '';
    },

    getNickname(user?: UserModel | null) {
        return user?.nickname || user?.name || '';
    },

    getAvatarUrl(baseUrl: string, user?: UserModel | null, size: number = 100) {
        return user?.avatarImageFile
            ? `https://${cloudimageToken}.cloudimg.io/bound/${size}x${size}/foil1/${File.getFileRemoteLocation(
                  baseUrl,
                  user.avatarImageFile
              )}`
            : User.getDefaultAvatarUrl(user);
    },

    getDefaultAvatarUrl(user?: UserModel | null) {
        return `https://avatars.dicebear.com/api/avataaars/${encodeURIComponent(
            User.getNickname(user) ?? ''
        )}.svg`;
    },

    isAdmin(user?: UserModel | null) {
        return user?.groups?.some((g) => g.isAdminGroup) ?? false;
    },

    isAuthor(user: UserModel | null | undefined, article: ArticleModel) {
        return Boolean(
            user && article.users?.find((u) => u.id === user.id)
        );
    },

    canEditArticle(user: UserModel | null | undefined, article: ArticleModel) {
        return User.isAdmin(user) || this.isAuthor(user, article);
    },
};
