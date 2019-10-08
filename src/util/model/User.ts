import { UserModel, ArticleModel } from 'model';

export const User = {
    getName(user: UserModel) {
        return user.name;
    },

    getNickname(user: UserModel) {
        return user.nickname || User.getName(user);
    },

    getAvatarUrl(user: UserModel) {
        return user.avatarImageFile ? user.avatarImageFile.remoteLocation : User.getDefaultAvatarUrl(user);
    },

    getDefaultAvatarUrl(user: UserModel) {
        return `https://avatars.dicebear.com/v2/avataaars/${encodeURIComponent(User.getNickname(user))}.svg`;
    },

    isAdmin(user?: UserModel | null) {
        return user && user.groups && user.groups.some(g => g.isAdminGroup);
    },

    isAuthor(user: UserModel | null | undefined, article: ArticleModel) {
        return Boolean(user && article.users && article.users.find(u => u.id === user.id));
    },

    canEditArticle(user: UserModel | null | undefined, article: ArticleModel) {
        return User.isAdmin(user) || this.isAuthor(user, article);
    },
};