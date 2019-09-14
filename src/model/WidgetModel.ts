import { ID } from './ID';
import { UserGroupModel } from './UserGroupModel';

export enum WidgetModelType {
    Calendar = 'CALENDAR',
    VPlan = 'VPLAN',
    TagCloud = 'TAGCLOUD',
}
export interface WidgetModel<C = any> {
    id: ID;
    title: string;
    type: WidgetModelType;
    group?: UserGroupModel;
    configuration: C;
}

export interface CalendarWidgetConfig {
    calendars: {
        url: string;
        groupId?: ID;
    }[];
}