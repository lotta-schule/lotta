export enum ContentModuleType {
    TEXT = 'TEXT'
}

export interface ContentModuleModel {
    id: string;
    type: ContentModuleType;
    text?: string;
}
