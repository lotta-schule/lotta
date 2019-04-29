import { UserModel } from './UserModel';

export interface LoginPayload {
    user: UserModel;
    token: string;
}
