import { ID } from './ID';

export interface CustomDomainModel {
    id: ID;
    host: string;
    isMainDomain: boolean;
    insertedAt: string;
    updatedAt: string;
}