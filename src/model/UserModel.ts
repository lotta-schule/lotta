export enum UserGroup {
    GUEST = 0,
    STUDENT = 10,
    TEACHER = 20,
    DIRECTION = 30,
    ADMIN = 40
}

export interface UserModel {
    id: string;
    name: string;
    email: string;
    avatar: string;
    group: UserGroup;
    phone?: string;
}
