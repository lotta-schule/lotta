import { ID } from './ID';

export interface GroupEnrollmentTokenModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    token: string;
}
