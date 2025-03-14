import * as React from 'react';
import { FileModel } from 'model';
import { File } from 'util/model';

export type ResponsiveImageProps = {
  file: Pick<FileModel, '__typename' | 'formats'> | null | undefined;
  alt: string;
  sizes?: string[] | [number, number] | string;
  format: string;
  fallback?: React.ReactNode | null;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'alt' | 'srcSet' | 'sizes'
>;

export const useResponsiveProps = (
  file: Pick<FileModel, '__typename' | 'formats'> | null | undefined,
  format: string,
  sizesAttr?: string[] | [number, number] | string
) => {
  const usePixelDensity = React.useMemo(
    () =>
      Array.isArray(sizesAttr) &&
      sizesAttr.length === 2 &&
      typeof sizesAttr[0] === 'number' &&
      typeof sizesAttr[1] === 'number',
    [sizesAttr]
  );

  const formats = React.useMemo(
    () =>
      file
        ? File.getAvailableFormats(file, format).filter((f) => {
            if (usePixelDensity && f.width) {
              return (sizesAttr as [number, number]).includes(f.width);
            }
            return true;
          })
        : undefined,
    [file, format, sizesAttr, usePixelDensity]
  );

  const sizes = React.useMemo(() => {
    if (Array.isArray(sizesAttr)) {
      if (usePixelDensity) {
        return undefined;
      }
      return sizesAttr.join(', ');
    }
    return sizesAttr;
  }, [sizesAttr, usePixelDensity]);

  const srcSet = React.useMemo(() => {
    if (!formats) {
      return undefined;
    }
    if (usePixelDensity) {
      return [formats.at(0), formats.at(-1)]
        .sort((a, b) => (a?.width ?? 0) - (b?.width ?? 0))
        .filter((f) => f !== undefined)
        .map(({ url }, i) => `${url} ${i + 1}x`)
        .join(',');
    }

    return (
      formats
        ?.reduce((acc, { url, width }) => acc + `, ${url} ${width}w`, '')
        ?.replace(/^, /, '') || undefined
    );
  }, [formats, usePixelDensity]);

  return React.useMemo(
    () =>
      ({
        srcSet,
        formats,
        sizes,
      }) as const,
    [srcSet, formats, sizes]
  );
};

export const ResponsiveImage = React.memo(
  ({
    file,
    className,
    fallback = null,
    sizes,
    format,
    ...imgProps
  }: ResponsiveImageProps) => {
    const { formats, ...responsiveProps } = useResponsiveProps(
      file,
      format,
      sizes
    );
    if (formats?.length) {
      return <img className={className} {...imgProps} {...responsiveProps} />;
    }

    if (imgProps.src) {
      return <img className={className} {...imgProps} />;
    }

    return fallback;
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
