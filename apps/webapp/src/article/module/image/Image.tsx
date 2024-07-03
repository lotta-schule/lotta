import * as React from 'react';
import { ImageImage } from './ImageImage';
import { ContentModuleComponentProps } from '../ContentModule';

export const Image = React.memo(
  ({
    contentModule,
    isEditModeEnabled,
    onUpdateModule,
  }: ContentModuleComponentProps<{
    caption?: string;
    isUsingFullHeight?: boolean;
  }>) => {
    const imageCaption = contentModule.content?.caption;

    if (!contentModule.files.length) {
      return <div data-testid="ImageContentModule" />;
    }

    return (
      <div data-testid="ImageContentModule">
        <ImageImage
          isEditModeEnabled={!!isEditModeEnabled}
          isUsingFullHeight={!!contentModule.configuration?.isUsingFullHeight}
          caption={imageCaption ?? ''}
          file={contentModule.files ? contentModule.files[0] : null}
          onUpdateFile={(newFile) =>
            onUpdateModule?.({ ...contentModule, files: [newFile] })
          }
          onUpdateCaption={(caption) =>
            onUpdateModule?.({
              ...contentModule,
              content: { caption: caption },
            })
          }
        />
      </div>
    );
  }
);
Image.displayName = 'Image';
