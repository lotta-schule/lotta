import { UserModel } from 'model';

export const RegisteredUser: UserModel = {
    id: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    email: 'user@lotta.schule',
    name: 'Ernesto Guevara',
    groups: [],
    nickname: 'Che'
};