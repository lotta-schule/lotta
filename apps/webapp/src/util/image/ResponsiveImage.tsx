import * as React from 'react';
import { FileModel } from 'model';
import { File } from 'util/model';

import styles from './ResponsiveImage.module.scss';
import clsx from 'clsx';

type FileInput = Pick<FileModel, '__typename'> & {
  formats: Pick<
    FileModel['formats'][number],
    'name' | 'availability' | 'url'
  >[];
};

export type ResponsiveImageProps = {
  file: FileInput | null | undefined;
  alt: string;
  format: string;
  fallback?: React.ReactNode | null;
  lazy?: boolean;
  sizes?: string[] | [number, number] | 'auto' | (string & {});
  animateOnLoad?: boolean;
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'alt' | 'srcSet' | 'sizes'
>;

export const useResponsiveProps = (
  file: FileInput | null | undefined,
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
    lazy,
    animateOnLoad,
    onLoad: onLoadProp,
    loading: loadingProp,
    ...imgProps
  }: ResponsiveImageProps) => {
    const { formats, ...responsiveProps } = useResponsiveProps(
      file,
      format,
      sizes
    );
    const [isLoaded, setIsLoaded] = React.useState(!lazy);

    const onLoad = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        onLoadProp?.(e);
        if (lazy && animateOnLoad) {
          setIsLoaded(true);
        }
      },
      [animateOnLoad, lazy, onLoadProp]
    );

    if (formats?.length) {
      return (
        <img
          loading={lazy ? 'lazy' : loadingProp}
          onLoad={lazy ? onLoad : onLoadProp}
          className={clsx(className, styles.image, {
            [styles.lazy]: lazy,
            [styles.loaded]: isLoaded,
            [styles.animateOnLoad]: animateOnLoad,
          })}
          {...imgProps}
          {...responsiveProps}
        />
      );
    }

    if (imgProps.src) {
      return (
        <img
          className={clsx(className, styles.image, {
            [styles.lazy]: lazy,
            [styles.loaded]: isLoaded,
            [styles.animateOnLoad]: animateOnLoad,
          })}
          loading={lazy ? 'lazy' : loadingProp}
          onLoad={lazy ? onLoad : onLoadProp}
          {...imgProps}
        />
      );
    }

    return fallback;
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';
