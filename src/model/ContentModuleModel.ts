import { FileModel } from "./FileModel";

export enum ContentModuleType {
    TITLE = 'TITLE',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
}

export interface ContentModuleModel<T = any> {
    id: string;
    type: ContentModuleType;
    sortKey: number;
    text?: string;
    files: FileModel[];
    configuration?: T;
}

export type ContentModuleInput = Omit<ContentModuleModel, 'id'>;