import { FileModel } from "./FileModel";

export enum ContentModuleType {
    TITLE = 'TITLE',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
}

export interface ContentModuleModel {
    id: string;
    type: ContentModuleType;
    sortKey: number;
    text?: string;
    files: FileModel[];
}

export type ContentModuleInput = Omit<ContentModuleModel, 'id'>;