export enum ContentModuleType {
    Text = 'Text'
}

export interface ContentModuleModel {
    id: string;
    type: ContentModuleType;
    text?: string;
}
