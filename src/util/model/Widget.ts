import { WidgetModel, WidgetModelType } from "model";
import { createElement } from "react";
import { CalendarTodayOutlined, AccountCircleOutlined } from "@material-ui/icons";

export const Widget = {
    getIcon(widget: WidgetModel) {
        return Widget.getIconForType(widget.type);
    },

    getIconForType(type: WidgetModelType) {
        switch (type) {
            case WidgetModelType.Calendar:
                return createElement(CalendarTodayOutlined);
            default:
                return createElement(AccountCircleOutlined);
        }
    },

    getProfileWidget(): WidgetModel {
        return {
            id: 0,
            title: 'Profil',
            type: WidgetModelType.UserNavigation,
            configuration: {}
        };
    }
};