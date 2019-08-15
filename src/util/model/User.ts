import { UserModel, ArticleModel } from 'model';

export const User = {
    getName(user: UserModel) {
        return user.name;
    },

    getNickname(user: UserModel) {
        return user.nickname || User.getName(user);
    },

    isAdmin(user?: UserModel | null) {
        return user && user.groups && user.groups.some(g => g.isAdminGroup);
    },

    isAuthor(user: UserModel | null | undefined, article: ArticleModel) {
        return Boolean(user && article.users.find(u => u.id === user.id));
    },

    canEditArticle(user: UserModel | null | undefined, article: ArticleModel) {
        return User.isAdmin(user) || this.isAuthor(user, article);
    }
};