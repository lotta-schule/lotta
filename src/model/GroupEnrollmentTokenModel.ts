import { ID } from './ID';

export interface GroupEnrollmentTokenModel {
    id: ID;
    createdAt: string;
    updatedAt: string;
    token: string;
}
