import { WidgetModel, WidgetModelType } from 'model';
import * as React from 'react';
import { ResponsiveImage } from 'util/image/ResponsiveImage';

export const Widget = {
  getIcon(widget: WidgetModel) {
    return widget.iconImageFile
      ? React.createElement(ResponsiveImage, {
          file: widget.iconImageFile,
          alt: '',
          format: 'icon',
          style: { width: '1.5rem', height: '1.5rem' },
        })
      : Widget.getIconForType(widget.type);
  },

  getIconForType(type: WidgetModelType) {
    switch (type) {
      case WidgetModelType.Schedule:
        return React.createElement('img', {
          src: '/img/schedule.svg',
          style: { width: '1.5rem', height: '1.5rem' },
        });
      case WidgetModelType.Calendar:
        return React.createElement('img', {
          src: '/img/calendar.svg',
          style: { width: '1.5rem', height: '1.5rem' },
        });
      case WidgetModelType.IFrame:
        return React.createElement('img', {
          src: '/img/profile.svg',
          style: { width: '1.5rem', height: '1.5rem' },
        });
      default:
        return React.createElement('img', {
          src: '/img/profile.svg',
          style: { width: '1.5rem', height: '1.5rem' },
        });
    }
  },

  getProfileWidget(): WidgetModel {
    return {
      id: '0',
      title: 'Profil',
      type: WidgetModelType.UserNavigationMobile,
      configuration: {
        icon: {
          iconName: 'accountcircle',
        },
      },
      groups: [],
    };
  },
};
