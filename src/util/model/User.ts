import { UserModel } from 'model';

export const User = {
    getName(user: UserModel) {
        return user.name;
    },

    getNickname(user: UserModel) {
        return user.nickname || User.getName(user);
    },
};