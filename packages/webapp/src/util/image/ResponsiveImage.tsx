import * as React from 'react';
import { ProcessingOptions, useImageUrl } from './useImageUrl';

export type ResponsiveImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  maxDisplayWidth?: number;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'src' | 'alt' | 'width'
> &
  Omit<ProcessingOptions, 'width' | 'height'>;

export const ResponsiveImage = React.memo(
  ({
    src,
    alt,
    style,
    className,
    width,
    height,
    aspectRatio,
    resize,
    sizes,
    maxDisplayWidth,
    ...imgProps
  }: ResponsiveImageProps) => {
    const { customStyle, sizeMap } = useImageUrl(
      src,
      {
        width,
        height,
        aspectRatio,
        resize,
      },
      { maxDisplayWidth }
    );
    return (
      <img
        className={className}
        srcSet={Object.entries(sizeMap)
          .map(([size, src]) => `${src} ${size}`)
          .join(', ')}
        alt={alt}
        style={{ ...customStyle, ...style }}
        sizes={sizes}
        {...imgProps}
      />
    );
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
