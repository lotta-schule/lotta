import * as React from 'react';
import { FileModel } from 'model';

export type ResponsiveImageProps = {
  file?: FileModel;
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'src' | 'alt' | 'width'
>;

export const ResponsiveImage = React.memo(
  ({
    file,
    format,
    alt,
    style,
    className,
    width,
    height,
    sizes,
    ...imgProps
  }: ResponsiveImageProps) => {
    const formats = file?.formats
      .filter(
        (availableFormat) =>
          (console.log({
            availableFormat,
            includes: ['ready', 'available'].includes(
              availableFormat.status.toLowerCase()
            ),
            startsWith:
              !format ||
              availableFormat.name
                .toLowerCase()
                .startsWith(format.toLowerCase()),
          }) as unknown) ||
          (['ready', 'available'].includes(
            availableFormat.status.toLowerCase()
          ) &&
            (!format ||
              availableFormat.name
                .toLowerCase()
                .startsWith(format.toLowerCase())))
      )
      .map((format) => {
        const formatMatch = format.name.match(
          /_(?:(?<width>\d+))(?:x(?<height>\d+))?/
        );
        if (!formatMatch) {
          return null;
        }
        const width =
          formatMatch.groups?.width && parseInt(formatMatch.groups.width, 10);
        const height =
          formatMatch.groups?.height && parseInt(formatMatch.groups.height, 10);

        return {
          ...format,
          width: width,
          height,
        };
      })
      .filter((f) => f !== null);

    const sizeMap = formats?.reduce(
      (acc, { url, width }) => acc + `, ${url} ${width}w`,
      ''
    );

    return (
      <img
        className={className}
        srcSet={sizeMap}
        alt={alt}
        width={width}
        height={height}
        style={{ ...style }}
        sizes={sizes}
        {...imgProps}
      />
    );
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
