import * as React from 'react';
import { FileModel } from 'model';
import { File } from 'util/model';

export type ResponsiveImageProps = {
  file: Pick<FileModel, '__typename' | 'formats'> | null | undefined;
  alt: string;
  format: string;
  fallback?: React.ReactNode | null;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'alt' | 'srcSet'
>;

export const ResponsiveImage = React.memo(
  ({
    file,
    format,
    className,
    fallback = null,
    ...imgProps
  }: ResponsiveImageProps) => {
    const formats = file && File.getAvailableFormats(file, format);

    const sizeMap = formats
      ?.reduce((acc, { url, width }) => acc + `, ${url} ${width}w`, '')
      ?.replace(/^, /, '');

    if (formats?.length) {
      return <img className={className} srcSet={sizeMap} {...imgProps} />;
    }

    if (imgProps.src) {
      return <img className={className} {...imgProps} />;
    }

    return fallback;
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
