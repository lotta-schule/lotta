import { FileModel } from './FileModel';
import { ID } from './ID';

export enum ContentModuleType {
    TITLE = 'TITLE',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    IMAGE_COLLECTION = 'IMAGE_COLLECTION',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOWNLOAD = 'DOWNLOAD',
}

export interface ContentModuleModel<T = any> {
    id: ID;
    type: ContentModuleType;
    sortKey: number;
    text?: string;
    files: FileModel[];
    configuration?: T;
}

export type ContentModuleInput = Omit<ContentModuleModel, 'id'>;