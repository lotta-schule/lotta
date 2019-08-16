import { FileModel } from './FileModel';
import { ID } from './ID';

export enum ContentModuleType {
    TITLE = 'TITLE',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
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