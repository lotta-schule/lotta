export enum EditModeType {
    Page,
    Article
}

export interface EditModePayloadModel {
    itemType: EditModeType;
    itemId: string;
}
