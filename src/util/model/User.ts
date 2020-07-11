import { UserModel, ArticleModel } from 'model';

export const User = {
    getName(user?: UserModel | null) {
        return user?.name;
    },

    getNickname(user?: UserModel | null) {
        return (user?.nickname || User.getName(user)) ?? '';
    },

    getAvatarUrl(user?: UserModel | null, size: number = 100) {
        return user?.avatarImageFile ?
            `https://afdptjdxen.cloudimg.io/bound/${size}x${size}/foil1/${user.avatarImageFile.remoteLocation}` :
            User.getDefaultAvatarUrl(user);
    },

    getDefaultAvatarUrl(user?: UserModel | null) {
        return `https://avatars.dicebear.com/api/avataaars/${encodeURIComponent(User.getNickname(user) ?? '')}.svg`;
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
