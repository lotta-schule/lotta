import { UserModel, ArticleModel } from 'model';

export const User = {
    getName(user?: UserModel | null) {
        return user?.name;
    },

    getNickname(user?: UserModel | null) {
        return user?.nickname || User.getName(user);
    },

    getAvatarUrl(user?: UserModel | null) {
        return user?.avatarImageFile ? user?.avatarImageFile.remoteLocation : User.getDefaultAvatarUrl(user);
    },

    getDefaultAvatarUrl(user?: UserModel | null) {
        return `https://avatars.dicebear.com/v2/avataaars/${encodeURIComponent(User.getNickname(user) ?? '')}.svg`;
    },

    isAdmin(user?: UserModel | null) {
        return user?.groups?.some(g => g.isAdminGroup) ?? false;
    },

    isAuthor(user: UserModel | null | undefined, article: ArticleModel) {
        return Boolean(user && article.users && article.users.find(u => u.id === user.id));
    },

    canEditArticle(user: UserModel | null | undefined, article: ArticleModel) {
        return User.isAdmin(user) || this.isAuthor(user, article);
    },
};