import * as React from 'react';
import { Checkbox } from '@lotta-schule/hubert';
import { ContentModuleConfigProps } from '../ContentModule';

export const Config = React.memo(
  ({
    contentModule,
    onUpdateModule,
    onRequestClose,
  }: ContentModuleConfigProps<{ isUsingFullHeight?: boolean }>) => {
    return (
      <form data-testid="ImageContentModuleConfiguration">
        <Checkbox
          isSelected={!!contentModule.configuration?.isUsingFullHeight}
          onChange={(isUsingFullHeight) => {
            onUpdateModule({
              ...contentModule,
              configuration: {
                ...contentModule.configuration,
                isUsingFullHeight,
              },
            });
            onRequestClose();
          }}
        >
          Bild in voller Höhe anzeigen
        </Checkbox>
        <p>
          Bilder werden normalerweise so angezeigt, dass sie bequem in den
          sichtbaren Bereich passen. Wenn du möchtest, dass das Bild in voller
          Höhe angezeigt wird, so dass unter Umständen gescrollt werden muss,
          aktiviere diese Option.
        </p>
      </form>
    );
  }
);
Config.displayName = 'ImageCollectionConfig';
