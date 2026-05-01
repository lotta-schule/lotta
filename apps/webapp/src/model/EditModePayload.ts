import { ID } from './ID.js';

export enum EditModeType {
  Page,
  Article,
}

export interface EditModePayloadModel {
  itemType: EditModeType;
  itemId: ID;
}
