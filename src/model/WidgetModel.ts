import { ID } from './ID';
import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export enum WidgetModelType {
    UserNavigation = '{0}',
    Calendar = 'CALENDAR',
    VPlan = 'VPLAN',
    TagCloud = 'TAGCLOUD',
}
export interface WidgetModel<C = any> {
    id: ID;
    title: string;
    type: WidgetModelType;
    iconImageFile?: FileModel;
    group?: UserGroupModel;
    configuration: C;
}

export interface CalendarWidgetConfig {
    calendars: CalendarWidgetCalendarConfig[];
}

export interface CalendarWidgetCalendarConfig {
    url: string;
    color?: string;
    name?: string;
    groupId?: ID;
}