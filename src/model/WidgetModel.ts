import { ID } from './ID';
import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export enum WidgetModelType {
    UserNavigation = '{0}',
    Calendar = 'CALENDAR',
    VPlan = 'VPLAN',
    TagCloud = 'TAGCLOUD',
    Schedule = 'SCHEDULE',
}
export interface WidgetModel<C = any> {
    id: ID;
    title: string;
    type: WidgetModelType;
    iconImageFile?: FileModel | null;
    groups: UserGroupModel[];
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

export interface ScheduleWidgetConfig {
    type: string;
    schoolId: string;
    username: string;
    password: string;
}