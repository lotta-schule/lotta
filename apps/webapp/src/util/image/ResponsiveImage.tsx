import * as React from 'react';
import { FileModel } from 'model';
import { File } from 'util/model';

export type ResponsiveImageProps = {
  file: Pick<FileModel, '__typename' | 'formats'> | null | undefined;
  alt: string;
  sizes?: string[] | string;
  format: string;
  fallback?: React.ReactNode | null;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'alt' | 'srcSet' | 'sizes'
>;

const createSizemap = (formats: ReturnType<typeof File.getAvailableFormats>, usePixelDensity = false) => {
  if (usePixelDensity) {
  return [formats.at(0), formats.at(-1)]
    .filter(f => f !== undefined).map(({url}, i) => `${url} ${i + 1}x`)
    .join(',');
  }

  return formats
  ?.reduce((acc, { url, width }) => acc + `, ${url} ${width}w`, '')
  ?.replace(/^, /, '');
};

export const ResponsiveImage = React.memo(
  ({
    file,
    format,
    className,
    sizes,
    fallback = null,
    ...imgProps
  }: ResponsiveImageProps) => {
    const formats = file && File.getAvailableFormats(file, format);

    const sizeMap = formats && createSizemap(formats, !sizes);

    if (formats?.length) {
      return <img className={className}  sizes={Array.isArray(sizes) ? sizes.join(',') : sizes} srcSet={sizeMap} {...imgProps} />;
    }

    if (imgProps.src) {
      return <img className={className} {...imgProps} />;
    }

    return fallback;
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
